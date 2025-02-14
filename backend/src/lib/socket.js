import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://chat-app-1-jb79.onrender.com', 'http://localhost:5173']
      : '*',
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  allowUpgrades: true,
  cookie: false
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
    
    // Join a personal room for private messages
    socket.join(`user_${userId}`);
    
    // Emit online users update
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("joinGroup", (groupId) => {
      socket.join(`group_${groupId}`);
      console.log(`User ${userId} joined group ${groupId}`);
    });

    socket.on("leaveGroup", (groupId) => {
      socket.leave(`group_${groupId}`);
      console.log(`User ${userId} left group ${groupId}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
      if (userId) {
        delete userSocketMap[userId]; // Remove user from the map
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); 
        socket.leave(`user_${userId}`);
      }
    });
  }
});

export function getRecieverSocketId(userId) {
  return userSocketMap[userId.toString()];
}

export const emitAIMessage = (groupId, message) => {
  io.to(`group_${groupId}`).emit("receiveAIMessage", message);
};

export function emitMessage(userId, message) {
  const socketId = userSocketMap[userId.toString()];
  if (socketId) {
    io.to(socketId).emit("newMessage", message);
  }
}

export { io, app, server };
