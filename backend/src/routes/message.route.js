import express from 'express';
import { 
    getMessages, 
    sendMessage, 
    getUsersForSidebar, 
    uploadMessageImage,
    getGroupMessages,
    sendGroupMessage
} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Individual chat routes
router.get("/user", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, uploadMessageImage, sendMessage);

// Group message routes - make sure these are defined before other routes
router.get("/group/:groupId", protectRoute, getGroupMessages);
router.post("/group/:groupId", protectRoute, uploadMessageImage, sendGroupMessage);

export default router;
