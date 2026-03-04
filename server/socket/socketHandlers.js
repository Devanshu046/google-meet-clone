/**
 * Sets up Socket.io event listeners for the server.
 * Handles user presence (join, leave) and WebRTC signaling (offer, answer, candidates).
 */
const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join a specific meeting room
    socket.on('join-room', ({ roomId, userName }) => {
      socket.join(roomId);
      // Store metadata on the socket to know which room this socket belongs to
      socket.data.roomId = roomId;
      socket.data.userName = userName;

      console.log(`[Socket] ${userName} (${socket.id}) joined room: ${roomId}`);

      // Notify all other clients in this room that a new user joined.
      // E.g. existing clients will receive this and spawn WebRTC Offers.
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        userName
      });
    });

    // WebRTC: Relay Offer to a target peer
    socket.on('offer', ({ targetUserId, offer, userName }) => {
      io.to(targetUserId).emit('offer', {
        offer,
        userId: socket.id,
        userName
      });
    });

    // WebRTC: Relay Answer back to the peer who made the offer
    socket.on('answer', ({ targetUserId, answer }) => {
      io.to(targetUserId).emit('answer', {
        answer,
        userId: socket.id
      });
    });

    // WebRTC: Relay ICE Candidates between peers for network discovery
    socket.on('ice-candidate', ({ targetUserId, candidate }) => {
      io.to(targetUserId).emit('ice-candidate', {
        candidate,
        userId: socket.id
      });
    });

    // Handle graceful leave (user clicks "Leave Meeting")
    socket.on('leave-room', () => {
      const roomId = socket.data.roomId;
      if (roomId) {
        console.log(`[Socket] ${socket.data.userName} left room manually`);
        socket.leave(roomId);
        socket.to(roomId).emit('user-disconnected', socket.id);
        socket.data.roomId = null; // Clear room ID since they left
      }
    });

    // Chat: Relay text messages to the room
    socket.on('chat-message', (data) => {
      const roomId = socket.data.roomId;
      if (roomId) {
        // Broadcast incoming chat message to everyone else in the room
        socket.to(roomId).emit('chat-message', data);
      }
    });

    // Handle forceful leave (user closes tab / network loss)
    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
      const roomId = socket.data.roomId;
      
      if (roomId) {
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });
};

module.exports = setupSocketHandlers;
