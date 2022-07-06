const router = require('express').Router();
const {
    getAllChats,
    createDMChatOrGroupChat,
    getChat,
    updateGroupChat,
    getAllInvites,
} = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadFileWithMulter } = require('../middlewares/multer.middleware');

router
    .route('/')
    .get(authMiddleware, getAllChats)
    .post(authMiddleware, uploadFileWithMulter.single('uploadedFile'), createDMChatOrGroupChat);
router.route('/:chat_id').get(authMiddleware, getChat);
router.route('/:chat_id/invites').get(authMiddleware, getAllInvites);
router.route('/:chat_id/:action_type').post(authMiddleware, updateGroupChat);

module.exports = { chatRoutes: router };
