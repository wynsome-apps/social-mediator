/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {WebSocketServer} = require("ws");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


let server; // http.Server
const wss = new WebSocketServer({noServer: true});

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    logger.log(`Received: ${message}`);
  });
  ws.send("Hello from the server!");
});

exports.websocketTest = onRequest(
    (req, res) => {
      const reqServer = req.socket.server;
      if (reqServer === server) return;
      server = reqServer;

      server.on("upgrade", (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      });

      // server.emit("request", req, res); // this is not sufficient
      res.setHeader("Retry-After", 0).status(503).send("Websockets now ready");
    });
