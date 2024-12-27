import multer from 'multer';
import path from 'path';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { io } from '../lib/socket.js'; // Ensure the correct path to socket.js
import cloudinary from '../lib/cloudinary.js';
import { getRecieverSocketId } from '../lib/socket.js';

// Configure multer for local storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/message_images'); // Save images to this folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Give unique names to files
    },
});

// Create the multer instance
const upload = multer({ storage });

// Get users for sidebar
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("error in getusersforsidebar", error.message);
        res.status(500).json({ error: "internal server error" });
    }
};

// Get messages for a specific user
export const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: myId, recieverId: userToChatId },
                { senderId: userToChatId, recieverId: myId }
            ]
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log("error in getting msgs", error.message);
        res.status(500).json({ error: "internal server error" });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body; // Get text from the request body
        const { id: recieverId } = req.params; // Get receiver ID from the request parameters
        const senderId = req.user._id; // Get sender ID from the authenticated user
        let imageUrl;

        // Check if an image was uploaded
        if (req.file) {
            imageUrl = req.file.path; // Get the path of the uploaded image
        }

        const newMessage = new Message({
            senderId,
            recieverId,
            text,
            image: imageUrl, // Save the image URL
        });
        await newMessage.save();

        // Emit new message to the receiver's socket
        const recieverSocketId = getRecieverSocketId(recieverId);
        if (recieverSocketId) {
            io.to(recieverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage); // Return the new message
    } catch (error) {
        console.log("Error in sending message:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Export the multer instance for use in routes
export const uploadMessageImage = upload.single('image'); // This will be used in the route