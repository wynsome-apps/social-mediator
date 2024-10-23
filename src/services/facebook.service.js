import axios from 'axios';
import { addToInboundMQ } from './messagequeue.service.js';

//function needed to verify the webhook by facebook. This is called by the GET request to the /ingest/facebook endpoint
export async function verifyWebhook(req) {
  console.log('Verifying Facebook webhook');
  const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  return new Promise((resolve) => {
    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        resolve({ status: 200, message: challenge });
      } else {
        console.log('Webhook verification failed');
        resolve({ status: 403, message: 'Forbidden' });
      }
    } else {
      console.log('Webhook mode or token not set');
      resolve({ status: 403, message: 'Forbidden' });
    }
  });
}

//function to handle the incoming message from Facebook. This is called by the POST request to the /ingest/facebook endpoint
export async function handleFacebookMessage(req, platform) {
  const body = req.body;
  // Handle messages
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const event = entry.messaging ? entry.messaging[0] : null;

      if (event && event.message) {
        const recipientPageId = event.recipient.id;
        const timeOfEvent = event.timestamp;
        const senderId = event.sender.id;
        const messageText = event.message.text;
        const compiledMessage = await prepareMessageForDiscipleTools(
          senderId,
          recipientPageId,
          platform,
          messageText,
          timeOfEvent
        );

        const response = await addToInboundMQ(compiledMessage);
        console.log(`sendToMQ response: ${response}`);

        return new Promise((resolve, reject) => {
          let success = response;
          if (!compiledMessage) {
            success = false;
          }
          if (success) {
            console.log('Message successfully added to queue');
            resolve({ status: 200, message: 'Message processed successfully' });
          } else {
            reject({ status: 500, message: 'Failed to process message' });
          }
        });
      }
    }
  }
}

export async function getSenderProfile(senderId) {
  const FBurl = `https://graph.facebook.com/v20.0/${senderId}?fields=first_name,last_name,profile_pic,locale,timezone&access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`;

  return await axios.get(FBurl);
}

export async function prepareMessageForDiscipleTools(
  senderId,
  recipientPageId,
  platform,
  messageText,
  timeOfEvent
) {
  const userProfile = await getSenderProfile(senderId);
  const { first_name, last_name, profile_pic, locale, timezone } =
    userProfile.data;

  // let first_name = "Micah ";
  // let last_name = "Mills";
  // let profile_pic = "test.com/pic";
  // let locale = "en";
  // let timezone = "UTC+3";

  const message = {
    senderId,
    recipientPageId,
    platform,
    first_name,
    last_name,
    profile_pic,
    locale,
    timezone,
    messageText,
    timeOfEvent,
  };

  return message;
}

export async function sendToFacebook(request) {
  // Process the response from Disciple Tools
  // Send a response to the user on Facebook using the Facebook Send API
  const messageData = {
    recipient: {
      id: request.recipientid,
    },
    message: {
      text: request.message,
    },
  };

  console.log(messageData);

  // Send the message to the Facebook Send API
  const response = await axios.post(
    `https://graph.facebook.com/v20.0/me/messages?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`,
    messageData
  );

  console.log('Response from Facebook:', response.data);

  return {
    status: 200,
    message: 'Response processed successfully',
  };
}

export default {
  verifyWebhook,
  handleFacebookMessage,
  getSenderProfile,
  prepareMessageForDiscipleTools,
  sendToFacebook,
};
