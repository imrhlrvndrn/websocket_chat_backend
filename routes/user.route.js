const router = require('express').Router();

// middlewares
const { authMiddleware } = require('../middlewares/auth.middleware');

// controllers
const { getAllChats } = require('../controllers/chat.controller');
const { searchAllUsers, userBlocking } = require('../controllers/user.controller');

router.route('/search').get(searchAllUsers);

router.route('/:userId/chats').get(authMiddleware, getAllChats);

router.route('/:block_type').post(authMiddleware, userBlocking);

// ! Needs to be implemented
// router.route('/:userId').get(authMiddleware, getUser);

module.exports = { userRoutes: router };
