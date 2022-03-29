const { Schema, model } = require('mongoose');

const chatSchema = new Schema(
    {
        name: { type: String },
        is_group_chat: { type: Boolean, default: false },
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        latest_message: { type: Schema.Types.ObjectId, ref: 'Message' },
        group_admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        // group_admins: [
        //     {
        //         user: { type: Schema.Types.ObjectId, ref: 'User' },
        //         permissions: [
        //             {
        //                 type: String,
        //                 enum: ['ADD_OR_REMOVE_USERS', 'DELETE_MESSAGES', 'ADMINISTRATOR'],
        //             },
        //         ],
        //     },
        // ],
    },
    { timestamps: true }
);

module.exports = model('Chat', chatSchema);
