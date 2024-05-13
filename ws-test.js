const WebSocket = require('ws');

// NOTE: it is wss:// on the next line, not https://
const url = 'wss://127.0.0.1:5001/social-mediator/us-central1/websocketTest';
// const url = 'wss://websockettest-c73eidiq7a-uc.a.run.app';
let retryCount = 0;
const maxRetries = 3;

function connectWebSocket() {
  const ws = new WebSocket(url);

  ws.on('open', function open() {
    ws.send('Hello from client!');
  });

  ws.on('message', function incoming(data) {
    console.log('Received from server:', data);
  });

  ws.on('error', function error(err) {
    if (String(err).includes('503') && retryCount < maxRetries) {
      retryCount++;
      console.log(`Retrying connection attempt ${retryCount}...`);
      connectWebSocket();
    } else {
      console.error('websockets error:', err);
    }
  });
}

connectWebSocket();