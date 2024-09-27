import axios from 'axios';

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
export async function handleFacebookMessage(req) {
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

        console.log(
          `Received message from senderId: ${senderId} at pageId: ${recipientPageId} at time: ${timeOfEvent} with message: ${messageText}`
        );

        const compiledMessage = await prepareMessageForDiscipleTools(
          senderId,
          messageText
        );

        console.log('Compiled message:', compiledMessage);

        return new Promise((resolve, reject) => {
          let success = true;
          if (!compiledMessage) {
            success = false;
          }
          if (success) {
            console.log('Message processed successfully');
            resolve({ status: 200, message: 'Message processed successfully' });
          } else {
            reject({ status: 500, message: 'Failed to process message' });
          }
        });

        //Next Steps:
        // Send it to DT API and wait for response

        // On response from DT API, send socket.io message to client
      }
    }
  }
}

export async function getSenderProfile(senderId) {
  const FBurl = `https://graph.facebook.com/v20.0/${senderId}?fields=first_name,last_name,profile_pic,locale,timezone&access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`;
  console.log('FBurl:', FBurl);
  return await axios.get(FBurl);
}

export async function prepareMessageForDiscipleTools(senderId, messageText) {
  const userProfile = await getSenderProfile(senderId);
  const { first_name, last_name, profile_pic, locale, timezone } =
    userProfile.data;
  const message = {
    senderId,
    first_name,
    last_name,
    profile_pic,
    locale,
    timezone,
    messageText,
  };

  return message;
}

export default {
  verifyWebhook,
  handleFacebookMessage,
  getSenderProfile,
  prepareMessageForDiscipleTools,
};
