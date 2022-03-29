const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
        chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, default: '', trim: true },
    },
    { timestamps: true }
);

module.exports = model('Message', messageSchema);
