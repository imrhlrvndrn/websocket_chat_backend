const router = require('express').Router();
const {
    getAllMessagesOfChat,
    execMessageOperations,
} = require('../controllers/message.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
// *Retrieve all the messages
// router.get('/sync', (req, res) => {
//     Message.find({})
//         .then((data) => {
//             res.status(200).json(data);
//         })
//         .catch((error) => {
//             res.status(500).send(error);
//         });
// });

// Add a new message
router.route('/:chat_id').get(authMiddleware, getAllMessagesOfChat);
router.route(`/:chat_id/:action_type`).post(authMiddleware, execMessageOperations);

module.exports = { messageRoutes: router };
