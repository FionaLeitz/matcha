import express from 'express';
import { protectedRoute } from '../middleware/auth.js';
import { sendMessage, getConversation } from '../controllers/messageController.js';

const router = express.Router();

router.use(protectedRoute)

router.post("/send", sendMessage)
router.get("/conversation/:userId", getConversation)

export default router;