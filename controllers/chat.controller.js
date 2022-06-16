const chatModel = require('../models/chat.model');
const userModel = require('../models/user.model');
const { successResponse } = require('../utils/error.utils');
const { badRequest, notFound, serverError } = require('../services/CustomError.service');
const { uploadFileToCloudinary } = require('../services/cloudinary.service');

const createDMChatOrGroupChat = async (req, res, next) => {
    const { action_type } = req.body;
    if (!action_type) return next(badRequest(`Please provide a valid action type`));

    switch (action_type) {
        case 'CREATE_DM_CHAT': {
            return await createChat(req, res, next);
        }

        case 'CREATE_GROUP_CHAT': {
            return await createGroupChat(req, res, next);
        }

        default: {
            return next(badRequest(`Please provide a valid action type`));
        }
    }
};

const createChat = async (req, res, next) => {
    const { friend_user_id } = req.body;
    console.log(`friend_user_id: ${friend_user_id}`);
    if (!friend_user_id) return next(badRequest(`Please provide a valid user ID`));

    let doesChatExist = await chatModel
        .findOne({
            is_group_chat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } },
                { users: { $elemMatch: { $eq: friend_user_id } } },
            ],
        })
        .populate({ path: 'latest_message' })
        .populate({ path: 'users', select: '-password -__v' });

    console.log(
        `doesChatExist with population (latest_message, users: '-password -__v'):`,
        doesChatExist
    );

    // ! Kind off a dumb move instead we could do
    // ! populate({ path: 'latest_message.sender', select: 'full_name avatar email' }) on **Line 19**
    doesChatExist = await userModel.populate(doesChatExist, {
        path: 'latest_message.sender',
        select: 'full_name email avatar',
    });
    console.log(`doesChatExist with population of some users:`, doesChatExist);

    if (doesChatExist) return successResponse(res, { data: { chat: doesChatExist } });

    try {
        let chatData = {
            name: 'DM chat',
            is_group_chat: false,
            users: [req.user._id, friend_user_id],
        };

        const newChat = await chatModel.create(chatData);
        console.log('new chat created => ', newChat);
        console.log('new chat populated => ', await newChat.populate('users'));
        return successResponse(res, { data: { chat: newChat } });
    } catch (error) {
        console.error(error);
        return next(badRequest(`Something went wrong => ${error.message}`));
    }
    const chat = new chatModel({});
    await chat.save();
    return chat;
};

const createGroupChat = async (req, res, next) => {
    let { name, users } = req.body;
    if (!name || !users) return next(badRequest(`Please provide a valid group name and add users`));
    users =
        users.filter((user) => user === req.user._id).length === 0
            ? [...users, req.user._id]
            : users;

    if (users.length < 2) return next(badRequest(`More than 2 users are required to form a group`));

    try {
        const uploadedFile = await uploadFileToCloudinary(req, next);
        if (!uploadedFile) return next(serverError(`Couldn't upload your group icon`));

        const chatData = new chatModel({
            name: name,
            is_group_chat: true,
            users,
            group_admins: [req.user._id],
            avatar: uploadedFile.secure_url,
        });

        const newChat = await chatData.save();

        const fetchedNewChat = await chatModel
            .findOne({ _id: newChat.id })
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v');

        return successResponse(res, {
            data: {
                chat: fetchedNewChat,
            },
        });
    } catch (error) {
        console.error(error);
        return next(badRequest(`Something went wrong => ${error.message}`));
    }
};

const getAllChats = async (req, res, next) => {
    try {
        const chats = await chatModel
            .find({ users: { $in: [req.user._id] } })
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v')
            .populate({ path: 'latest_message', select: 'full_name email avatar' })
            .sort({ updatedAt: -1 });
        if (!chats) return next(badRequest(`No chats found`));

        return successResponse(res, { data: { chats } });
    } catch (error) {
        console.error(error);
        return next(badRequest(`Something went wrong => ${error.message}`));
    }
};

const getChat = async (req, res, next) => {
    const { chatId } = req.params;
    if (!chatId) return next(badRequest(`Please provide a group ID`));

    try {
        const chat = await chatModel
            .findOne({ _id: chatId })
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v');
        if (!chat) return next(notFound(`Sorry, we couldn't find the chat!`));

        console.log('Chat info => ', chat);

        return successResponse(res, { data: { chat } });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

const addUserToGroupChat = async (req, res, next) => {
    const { chatId } = req.params;
    if (!chatId) return next(badRequest(`Please provide a chat id`));
    const { new_members } = req.body;
    if (!new_members) return next(badRequest(`Please provide a user id`));
    if (!new_members instanceof Array)
        return next(badRequest(`Please provide the user ids in an Array`));

    try {
        const returnedGroupChat = await chatModel
            .findOne({ _id: chatId })
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v');
        if (!returnedGroupChat)
            return next(notFound(`The chat you're trying to update doesn't exist`));

        const transformedGroupChat = returnedGroupChat.users.map((user) => user.id);
        const usersWhoCanBeAdded = new_members.filter(
            (user_id) => !transformedGroupChat.includes(user_id)
        );
        returnedGroupChat.users = [...returnedGroupChat.users, ...usersWhoCanBeAdded];

        const updatedGroupChat = await returnedGroupChat.save();
        console.log('updated group chat => ', updatedGroupChat);
        console.log('match check => ', returnedGroupChat === updatedGroupChat);

        return successResponse(res, { data: { chat: updatedGroupChat } });
    } catch (error) {
        console.error(error);
        return next(badRequest(`Something went wrong => ${error.message}`));
    }
};

const removeUserFromGroupChat = async (req, res, next) => {
    const { chatId } = req.params;
    if (!chatId)
        return next(badRequest(`The group you're trying to remove a user from doesn't exist`));
    const { user_id } = req.body;
    if (!remove_members) return next(badRequest(`Please provide a valid user`));

    try {
        const updatedGroupChat = await chatModel
            .findOne({ _id: chatId }, { $pull: { users: user_id } }, { new: true })
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v');
        if (!updatedGroupChat)
            return next(notFound(`The chat you're trying to update doesn't exist`));

        return successResponse(res, { data: { chat: updatedGroupChat } });
    } catch (error) {
        console.error(error);
        return next(badRequest(`Something went wrong => ${error.message}`));
    }
};

const renameGroup = async (req, res, next) => {
    const { chatId } = req.params;
    const { new_name } = req.body;
    if (!new_name) return next(badRequest(`Please provide a valid new name for the group`));

    try {
        const updatedGroupChat = await chatModel
            .findOneAndUpdate(
                { _id: chatId, is_group_chat: true },
                { name: new_name },
                { new: true }
            )
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v');
        if (!updatedGroupChat) return next(notFound(`No group chat found`));

        // ! console
        console.log('Renamed group chat => ', updatedGroupChat);

        return successResponse(res, { data: { chat: updatedGroupChat } });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

const modifyAdmins = async (req, res, next) => {
    try {
        const updatedGroupChat = await chatModel
            .findOneAndUpdate({ _id: chatId }, { group_admins: admins }, { new: true })
            .populate('users', '-password -__v')
            .populate('group_admins', '-password -__v');

        // ! console
        console.log('Modified group chat admins => ', updatedGroupChat);

        return successResponse(res, { data: { chat: updatedGroupChat } });
    } catch (error) {
        console.error(error);
        return next(error);
    }
};

const deleteGroupChat = async (req, res, next) => {
    const { chatId } = req.params;
    if (!chatId) return next(badRequest(`The group you're trying to delete doesn't exist`));

    try {
        const chat = await chatModel.findOneAndDelete({ _id: chatId });
        if (!chat) return next(notFound(`The chat you're trying to delete doesn't exist`));

        return successResponse(res, { data: { chat } });
    } catch (error) {
        console.error(error);
        return next(badRequest(`Something went wrong => ${error.message}`));
    }
};

const updateGroupChat = async (req, res, next) => {
    const { chatId, action_type } = req.params;
    if (!chatId) return next(badRequest(`Please provide a chat ID`));

    if (!action_type) return next(badRequest(`Please provide an action type`));

    switch (action_type) {
        case 'rename': {
            return await renameGroup(req, res, next);
        }

        case 'admins': {
            return await modifyAdmins(req, res, next);
        }

        case 'add-user': {
            return await addUserToGroupChat(req, res, next);
        }

        case 'remove-user': {
            return await removeUserFromGroupChat(req, res, next);
        }

        case 'delete': {
            return await deleteGroupChat(req, res, next);
        }

        default: {
            return next(badRequest(`Please provide a valid action type`));
        }
    }
};

module.exports = {
    getAllChats,
    createDMChatOrGroupChat,
    getChat,
    updateGroupChat,
};
