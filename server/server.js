const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const setupSocketHandlers = require('./socket/socketHandlers');

const app = express();
// Enable CORS for frontend requests
app.use(cors());

const server = http.createServer(app);

// Setup Socket.io with CORS configuration
const io = new Server(server, {
  cors: {
    origin: '*', // Allowing all origins for local development. Adjust for production.
    methods: ['GET', 'POST']
  }
});

// Initialize socket handlers to manage rooms and signaling
setupSocketHandlers(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
