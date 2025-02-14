import multer from 'multer';
import path from 'path';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { io } from '../lib/socket.js'; // Ensure the correct path to socket.js
import cloudinary from '../lib/cloudinary.js';
import { getRecieverSocketId } from '../lib/socket.js';
import Group from '../models/group.model.js';  // Add this import
import { processAIMessage, summarizeUnreadMessages } from '../services/gemini.service.js';
import { AI_USER_ID, AI_DEFAULTS } from '../config/constants.js';

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
        })
        .populate('senderId', 'fullName email profilePic')
        .populate('recieverId', 'fullName email profilePic')
        .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

// Send a message
export const sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        const newMessage = new Message({
            senderId,
            recieverId: receiverId,
            text
        });
        await newMessage.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'fullName email profilePic')
            .populate('recieverId', 'fullName email profilePic');

        // Emit to both users
        io.to(`user_${receiverId}`).emit("newMessage", populatedMessage);
        io.to(`user_${senderId}`).emit("newMessage", populatedMessage);

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Extract mentions from text
const extractMentions = async (text, groupId) => {
    const mentionRegex = /@([a-zA-Z0-9._]+)/g;
    const mentions = text.match(mentionRegex) || [];
    const usernames = mentions
        .map(mention => mention.substring(1))
        .filter(username => username !== 'gemini');
    
    if (usernames.length === 0) return [];
    
    // First try to find users by username
    let mentionedUsers = await User.find({
        $or: [
            { username: { $in: usernames } },
            { email: { $in: usernames.map(u => `${u}@example.com`) } }
        ]
    });

    // If some users weren't found, try matching by email prefix
    const foundUsernames = mentionedUsers.map(u => u.username);
    const missingUsernames = usernames.filter(u => !foundUsernames.includes(u));
    
    if (missingUsernames.length > 0) {
        const emailPrefixUsers = await User.find({
            email: { 
                $in: missingUsernames.map(u => new RegExp('^' + u + '@')) 
            }
        });
        mentionedUsers = [...mentionedUsers, ...emailPrefixUsers];
    }

    // Verify users are in the group
    const group = await Group.findById(groupId);
    if (group) {
        mentionedUsers = mentionedUsers.filter(user => 
            group.members.includes(user._id)
        );
    }
    
    console.log('Found mentioned users:', mentionedUsers); // Debug log
    return mentionedUsers.map(user => user._id);
};

// Get group messages
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const messages = await Message.find({
            groupId,
            isGroupMessage: true
        })
        .populate('senderId', 'fullName email profilePic username')
        .populate('mentions', 'fullName email profilePic username')
        .sort({ createdAt: 1 })
        .lean();

        // Log messages for debugging
        console.log('Messages before processing:', messages);

        const populatedMessages = messages.map(msg => {
            if (msg.isAIMessage) {
                return {
                    ...msg,
                    senderId: { ...AI_DEFAULTS }
                };
            }
            return msg;
        });

        // Log messages after processing
        console.log('Messages after processing:', populatedMessages);

        res.status(200).json(populatedMessages);
    } catch (error) {
        console.error('Error in getGroupMessages:', error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

// Send a group message
export const sendGroupMessage = async (req, res) => {
    try {
        const { groupId } = req.params;
        const roomId = `group_${groupId}`;
        const mentionsAI = /@gemini\b/i.test(req.body.text);
        
        // Extract user mentions with groupId context
        const mentionedUserIds = await extractMentions(req.body.text, groupId);

        // Create and save user message
        const newMessage = new Message({
            senderId: req.user._id,
            groupId,
            text: req.body.text,
            isGroupMessage: true,
            mentionedAI: mentionsAI,
            mentions: mentionedUserIds
        });

        await newMessage.save();
        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'fullName email profilePic username')
            .populate('mentions', 'fullName email profilePic username');

        // Debug log
        console.log('Populated message:', populatedMessage);

        // Emit user message once
        io.to(roomId).emit("receiveGroupMessage", populatedMessage);

        if (mentionsAI) {
            // Ensure typing state is emitted
            io.to(roomId).emit("aiTyping", true);
            
            try {
                const aiQuery = req.body.text.replace(/@gemini\b/i, '').trim();
                const aiResponse = await processAIMessage(aiQuery, []);
                
                const aiMessage = new Message({
                    senderId: AI_USER_ID,
                    groupId,
                    text: aiResponse,
                    isGroupMessage: true,
                    isAIMessage: true
                });

                await aiMessage.save();

                // Clear typing state before sending response
                io.to(roomId).emit("aiTyping", false);
                io.to(roomId).emit("receiveAIMessage", {
                    ...aiMessage.toObject(),
                    senderId: { _id: AI_USER_ID, ...AI_DEFAULTS }
                });
            } catch (error) {
                io.to(roomId).emit("aiTyping", false);
                io.to(roomId).emit("aiError", "Sorry, I couldn't process that request.");
            }
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Error in sendGroupMessage:', error);
        res.status(500).json({ error: "Failed to send message" });
    }
};

export const getUnreadSummary = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { lastReadTime } = req.query;

    // Get unread messages
    const unreadMessages = await Message.find({
      groupId,
      isGroupMessage: true,
      createdAt: { $gt: new Date(lastReadTime) }
    }).populate('senderId', 'fullName')
      .sort({ createdAt: 1 });

    if (unreadMessages.length === 0) {
      return res.json({ summary: "No unread messages" });
    }

    // Get summary from Gemini
    const summary = await summarizeUnreadMessages(unreadMessages);
    
    res.json({
      summary,
      unreadCount: unreadMessages.length,
      timespan: {
        from: unreadMessages[0].createdAt,
        to: unreadMessages[unreadMessages.length - 1].createdAt
      }
    });

  } catch (error) {
    console.error('Error getting unread summary:', error);
    res.status(500).json({ error: "Failed to get message summary" });
  }
};

// Export the multer instance for use in routes
export const uploadMessageImage = upload.single('image'); // This will be used in the route