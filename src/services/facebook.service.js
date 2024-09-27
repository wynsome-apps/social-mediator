// import axios from 'axios';

export async function handleFacebookMessage(req) {
  console.log('Handling Facebook message:');
  const body = req.body;
  console.log(body);
  // Handle messages
  if (body.object === 'page') {
    for (const entry of body.entry) {
      const event = entry.messaging ? entry.messaging[0] : null;

      if (event && event.message) {
        // const pageId = event.recipient.id;
        // const senderId = event.sender.id;
        // const messageText = event.message.text;

        return new Promise((resolve, reject) => {
          const success = true; // Replace with actual logic
          if (success) {
            console.log('Message processed successfully');
            resolve({ status: 200, message: 'Message processed successfully' });
          } else {
            reject({ status: 500, message: 'Failed to process message' });
          }
        });
        // Forward message to Disciple.Tools
        // try {
        //     const DTResponse = await axios.post(`${process.env.DISCIPLE_TOOLS_API_URL}`, {
        //         senderId: senderId,
        //         message: messageText,
        //         platform: 'facebook',
        //         timestamp: event.timestamp,
        //     });

        //     res.status(200).send('EVENT_RECEIVED');
        // } catch (error) {
        //     console.error("Error forwarding message to Disciple.Tools: ", error);
        //     res.sendStatus(500);
        // }
      }
    }
  }
}

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

export default {
  handleFacebookMessage,
  verifyWebhook,
};
