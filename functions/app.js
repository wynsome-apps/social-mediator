/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const express = require('express');
const {addUser, getUser, deleteUser} = require('./users');
const logger = require("firebase-functions/logger");

const app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', async (req, res) => {
  // res.status(200).send({ success: 'true?' });
  res.render('index');
});

// [START cloudrun_websockets_server]
// Initialize Socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://127.0.0.1:5000"
  }
});


// Listen for new connection
io.on('connection', socket => {
  // Add listener for "signin" event
  socket.on('signin', async ({user, room}, callback) => {
    try {
      // Record socket ID to user's name and chat room
      logger.debug({action: 'signin', user, room});
      addUser(socket.id, user, room);
      // Call join to subscribe the socket to a given channel
      socket.join(room);
      // Emit notification event
      socket.in(room).emit('notification', {
        title: "Someone's here",
        description: `${user} just entered the room`,
      });
      // Retrieve room's message history or return null
      // const messages = await getRoomFromCache(room);
      // Use the callback to respond with the room's message history
      // Callbacks are more commonly used for event listeners than promises
      // callback(null, messages);
      callback(null);
    } catch (err) {
      callback(err, null);
    }
  });

  // [START cloudrun_websockets_update_socket]
  // Add listener for "updateSocketId" event
  socket.on('updateSocketId', async ({user, room}) => {
    try {
      logger.debug({action: 'updateSocketId', user, room});
      addUser(socket.id, user, room);
      socket.join(room);
    } catch (err) {
      console.error(err);
    }
  });
  // [END cloudrun_websockets_update_socket]

  // Add listener for "sendMessage" event
  socket.on('sendMessage', (message, callback) => {
    // Retrieve user's name and chat room  from socket ID
    const {user, room} = getUser(socket.id);
    if (room) {
      const msg = {user, text: message};
      // Push message to clients in chat room
      io.in(room).emit('message', msg);
      // addMessageToCache(room, msg);
      callback();
    } else {
      callback('User session not found.');
    }
  });

  // Add listener for disconnection
  socket.on('disconnect', () => {
    // Remove socket ID from list
    const {user, room} = deleteUser(socket.id);
    if (user) {
      io.in(room).emit('notification', {
        title: 'Someone just left',
        description: `${user} just left the room`,
      });
    }
  });
});
// [END cloudrun_websockets_server]

module.exports = server;
