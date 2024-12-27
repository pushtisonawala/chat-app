import express from 'express'
import {getUsersForSidebar,getMessages,sendMessage,uploadMessageImage}from '../controllers/message.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js';
const router=express.Router();
router.get("/user",protectRoute,getUsersForSidebar);
router.get("/:id",protectRoute,getMessages)

router.post("/send/:id", protectRoute, uploadMessageImage, sendMessage); // Use multer middleware here

export default router;
