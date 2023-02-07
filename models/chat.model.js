const { Schema, model } = require('mongoose');

const chatSchema = new Schema(
    {
        name: { type: String, trim: true },
        avatar: { type: String, default: '' },
        is_group_chat: { type: Boolean, default: false },
        created_by: { type: Schema.Types.ObjectId, ref: 'User' },
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        latest_message: { type: Schema.Types.ObjectId, ref: 'Message', default: null },
        invites: [
            {
                created_by: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                },
                use_count: { type: Number, default: 0 },
                token: { type: String, trim: true, unique: true },
                // Use JWT for expiration & chat information logic
            },
        ],
    },
    { timestamps: true }
);

module.exports = model('Chat', chatSchema);
