import express from 'express';
import { createGroup, getGroups, getGroupById, updateGroupProfile, upload } from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createGroup);
router.get('/', protectRoute, getGroups);
router.get('/:id', protectRoute, getGroupById);
router.put('/:groupId/profile', protectRoute, upload.single('groupProfilePic'), updateGroupProfile);

export default router;
