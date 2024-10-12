import axios from 'axios';
import https from 'https';

export async function sendToDiscipleTools(message) {
  //an array for to map an pageid to a dt endpoint. This will eventually be a database lookup.
  const DTEndpointList = {
    // 1487685951308946: {
    //   url: 'https://conversations.gospelambition.com/wp-json/dt-public/disciple_tools_conversations/v1/incoming_conversation',
    //   apiKey: ''
    // }

    1487685951308946: {
      endpoint: process.env.DT_ENDPOINT,
      apiKey: process.env.DT_API_KEY,
    },
  };

  let endpoint = DTEndpointList[message.recipientPageId].endpoint;
  let apiKey = DTEndpointList[message.recipientPageId].apiKey;

  if (!endpoint) {
    console.error(
      'No endpoint found for recipient page ID:',
      message.recipientPageId
    );
    return;
  }
  console.log('Forwarding message to Disciple.Tools:', message);

  let options = {
    method: 'POST',
    url: endpoint,
    data: message,
    headers: {
      Authorization: apiKey,
    },
    // THIS IS FOR TESTING TODO: REMOVE IN PRODUCTION: Create an HTTPS agent that ignores SSL certificate validation
    httpsAgent: new https.Agent({
      rejectUnauthorized: false, // Ignore self-signed certificate errors
    }),
  };

  try {
    const response = await axios(options);
    console.log(response.status);
    if (response.status === 200) {
      return response;
    } else {
      console.error(
        'Error forwarding message to Disciple.Tools:',
        response.status,
        response.statusText
      );
      return {
        status: response.status,
        message: 'Error forwarding message to Disciple.Tools',
        error: response.statusText,
      };
    }
  } catch (error) {
    console.error('Error forwarding message to Disciple.Tools:', error);
    return {
      status: 500,
      message: 'Error forwarding message to Disciple.Tools',
      error: error.message,
    };
  }
}

export default {
  sendToDiscipleTools,
};
