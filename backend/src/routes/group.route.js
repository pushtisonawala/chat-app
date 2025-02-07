import express from 'express';
import { createGroup, getGroups, getGroupById } from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, createGroup);
router.get('/', protectRoute, getGroups);
router.get('/:id', protectRoute, getGroupById);

export default router;
