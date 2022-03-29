const router = require('express').Router();
const {
    getAllChats,
    createDMChatOrGroupChat,
    getChat,
    updateGroupChat,
} = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.route('/').get(authMiddleware, getAllChats).post(authMiddleware, createDMChatOrGroupChat);
router.route('/:chatId').get(authMiddleware, getChat);
router.route('/:chatId/:action_type').post(authMiddleware, updateGroupChat);


module.exports = { chatRoutes: router };
