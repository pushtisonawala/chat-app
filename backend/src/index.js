import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";
import messageRoutes from "./routes/message.route.js";
import path from "path";
import groupRouter from './routes/group.route.js'; // ✅ Correct import
import { findAvailablePort } from './lib/serverUtils.js';

dotenv.config();
const _dirname = path.resolve();

const allowedOrigins = [
  'http://localhost:5173',
  'https://chat-app-1-jb79.onrender.com'
];

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, true); // Allow in production for now
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRouter); // ✅ Ensure this is correctly used

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(_dirname, "../frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(_dirname, "../frontend", "dist", "index.html"));
    });
}

const startServer = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const port = await findAvailablePort();
        
        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });

    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

const cleanup = () => {
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// Start server
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
