import axios from 'axios';
import https from 'https';

// THIS IS FOR TESTING TODO: REMOVE IN PRODUCTION: Create an HTTPS agent that ignores SSL certificate validation
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

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
        const platform = event.platform;
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

        const response = await sendToDiscipleTools(compiledMessage);

        console.log('Response from Disciple.Tools:', response);

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

export async function sendToDiscipleTools(message) {
  //an array for to map an pageid to a dt endpoint. This will eventually be a database lookup.
  const DTEndpointList = {
    1487685951308946:
      'https://conversations.gospelambition.com/wp-json/dt-public/disciple_tools_conversations/v1/incoming_conversation',
    // 1487685951308946: 'https://dt.local/wp-json/dt-public/disciple_tools_conversations/v1/incoming_conversation'
  };

  let endpoint = DTEndpointList[message.recipientPageId];
  if (!endpoint) {
    console.error(
      'No endpoint found for recipient page ID:',
      message.recipientPageId
    );
    return;
  }
  try {
    const response = await axios.post(endpoint, message, { httpsAgent });
    return {
      status: response.status,
      message: 'Message forwarded successfully',
    };
  } catch (error) {
    console.error('Error forwarding message to Disciple.Tools:', error);
    return {
      status: 500,
      message: 'Error forwarding message to Disciple.Tools',
      error: error.message,
    };
  }
}

export async function sendToFacebook(request) {
  // Process the response from Disciple Tools
  console.log('Received response from Disciple Tools:', request);

  // Send a response to the user on Facebook using the Facebook Send API
  const messageData = {
    recipient: {
      id: request.recipientID,
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
  sendToDiscipleTools,
  sendToFacebook,
};
