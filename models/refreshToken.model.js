const { Schema, model } = require('mongoose');

const refreshTokenSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        token: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = model('RefreshToken', refreshTokenSchema);
