// Import the io instance from server
const { io } = require('../server');

// Emit a notification to a specific user
const emitToUser = (userId, eventType, data) => {
  // In a real application, you would emit to a specific user room
  // For now, we'll emit to all connected clients
  io.emit(eventType, data);
  console.log(`Emitted ${eventType} to user ${userId}:`, data);
};

// Broadcast to all job seekers
const broadcastToAllJobSeekers = (eventType, data) => {
  // In a real application, you would emit to all job seekers
  // For now, we'll emit to all connected clients
  io.emit(eventType, data);
  console.log(`Broadcasted ${eventType} to all job seekers:`, data);
};

module.exports = {
  emitToUser,
  broadcastToAllJobSeekers
};