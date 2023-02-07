const { Schema, model } = require('mongoose');
const Hash = require('../services/hash.service');

const userSchema = new Schema(
    {
        full_name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true },
        password: { type: String, required: true },
        avatar: {
            type: String,
            required: true,
            default:
                'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
        },
        blocked: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    },
    { timestamps: true }
);

userSchema.methods.validatePassword = async function (password = '') {
    const isValid = await Hash.verify(password, this.password);
    return isValid;
};

userSchema.pre('save', async function (next) {
    // ! Check if password is hashed again whenever we use .save() in other controllers
    // if (!this.isModified) {
    //     return next();
    // }

    this.password = await Hash.encrypt(this.password);
});

module.exports = model('User', userSchema);
