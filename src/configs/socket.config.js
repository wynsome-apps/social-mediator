export default function (io, socket) {
  // Add listener for "signin" event
  socket.on('join', async (room) => {
    try {
      // Record socket ID to user's name and chat room
      console.log({ action: 'join', room });
      // Call join to subscribe the socket to a given channel
      socket.join(room);
      // Use the callback to respond with the room's message history
      // Callbacks are more commonly used for event listeners than promises
      // callback(null, messages);
      // callback(null);
    } catch (err) {
      console.log(err);
    }
  });

  // // [START cloudrun_websockets_update_socket]
  // // Add listener for "updateSocketId" event
  // socket.on('updateSocketId', async ({ user, room }) => {
  //   try {
  //     console.log({ action: 'updateSocketId', user, room });
  //     addUser(socket.id, user, room);
  //     socket.join(room);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // });
  // // [END cloudrun_websockets_update_socket]

  // // Add listener for "sendMessage" event
  // socket.on('sendMessage', (message, callback) => {
  //   // Retrieve user's name and chat room  from socket ID
  //   const { user, room } = getUser(socket.id);
  //   if (room) {
  //     const msg = { user, text: message };
  //     // Push message to clients in chat room
  //     io.in(room).emit('message', msg);
  //     // addMessageToCache(room, msg);
  //     callback();
  //   } else {
  //     callback('User session not found.');
  //   }
  // });

  // Add listener for disconnection
  // socket.on('disconnect', () => {
  //   // Remove socket ID from list
  //   const { user, room } = deleteUser(socket.id);
  //   if (user) {
  //     io.in(room).emit('notification', {
  //       title: 'Someone just left',
  //       description: `${user} just left the room`,
  //     });
  //   }
  // });
}
