import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { getConversationMessages, getConversations, sendMessage, startConversation, } from '../controllers/chatController.js';
const router = express.Router();
router.use(authMiddleware);
router.get('/', getConversations);
router.post('/start', startConversation);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);
export default router;
//# sourceMappingURL=chatRoutes.js.map