const { Schema, model } = require('mongoose');

const messageSchema = new Schema(
    {
        chat: { type: Schema.Types.ObjectId, ref: 'Chat' },
        sender: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String, default: '', trim: true },
        read_by: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

module.exports = model('Message', messageSchema);
