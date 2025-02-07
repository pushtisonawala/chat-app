import express from 'express';
import { createGroup, getGroups, getGroupById, addMember } from '../controllers/groupController.js';

const router = express.Router();

router.post('/groups', createGroup);
router.get('/groups', getGroups);
router.get('/groups/:id', getGroupById);
router.post('/groups/:id/members', addMember);

export default router;