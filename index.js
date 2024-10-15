import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import socketConfig from './src/configs/socket.config.js';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.locals.io = io;
io.on('connection', (socket) => {
  console.log('socket connected');
  socketConfig(io, socket);
});

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
