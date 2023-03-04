const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const { serverError, badRequest, notFound } = require('../services/CustomError.service');
const { successResponse } = require('../utils/error.utils');

const sendNewMessage = async (req, res, next) => {
    const { content } = req.body;
    if (!content) return next(badRequest(`Please type a message before sending`));

    try {
        let new_message = await messageModel.create({
            sender: req.user._id,
            content,
            chat: req.params.chat_id,
        });

        // new_message = await new_message.save();
        console.log('Saved new message => ', new_message);

        new_message = await new_message.populate({ path: 'chat' });
        // new_message = await new_message.populate({
        //     path: 'chat.users',
        //     select: 'full_name avatar',
        // });
        new_message = await new_message.populate({ path: 'sender', select: 'full_name avatar' });
        console.log('Populated new message => ', new_message);

        await chatModel.findOneAndUpdate(
            { _id: new_message?.chat?._id },
            { latest_message: new_message?._id }
        );

        return successResponse(res, { data: { message: new_message } });
    } catch (error) {
        console.error(error);
        return next(serverError(`Couldn't save new message. Please try again`));
    }
};

const deleteChatMessage = async (req, res, next) => {
    const { message_id } = req.body;
    if (!message_id) return next(badRequest(`Please specify a message to delete`));
    const { chat_id } = req.params;

    try {
        let filter = {
            _id: message_id,
            chat: chat_id,
        };
        const deleted_message = await messageModel.findOne(filter);
        if (!deleted_message)
            return next(notFound(`Sorry we couldn't find the message to delete. Please try again`));

        await messageModel.deleteOne(filter);

        return successResponse(res, { data: { message: deleted_message } });
    } catch (error) {
        console.error(error);
        return next(serverError(`We couldn't delete the message. Please try again`));
    }
};

const getAllMessagesOfChat = async (req, res, next) => {
    const { chat_id } = req.params;

    try {
        const chat_messages = await messageModel.find({ chat: chat_id }).populate('sender');

        return successResponse(res, { data: { messages: chat_messages } });
    } catch (error) {
        console.error(error);
        return next(serverError(`Couldn't get chat messages. Please try again`));
    }
};

const execMessageOperations = async (req, res, next) => {
    switch (req.params.action_type) {
        case 'new': {
            await sendNewMessage(req, res, next);
            break;
        }

        case 'delete': {
            await deleteChatMessage(req, res, next);
            break;
        }

        default:
            next(badRequest(`Please provide a valid action type`));
            break;
    }
};

module.exports = { execMessageOperations, getAllMessagesOfChat };
