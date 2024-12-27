import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Make sure this is the frontend address
  },
});

const userSocketMap = {}; // Store users connected by their userId

// Middleware to attach io instance to request object
app.use((req, res, next) => {
  req.io = io; // Attach io to the request object for further use if needed
  next();
});

// Socket connection logic
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId; // Getting userId from query params

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Emit online users to all clients
  }

  // When a user disconnects, remove them from the map and notify others
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId]; // Remove user from the map
      io.emit("getOnlineUsers", Object.keys(userSocketMap)); 
    }
  });
});

export function getRecieverSocketId(userId) {
  return userSocketMap[userId];
}

export { io, app, server };
