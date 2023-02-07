const jwt = require('jsonwebtoken');
const refreshTokenModel = require('../models/refreshToken.model');

const accessTokenSecret = process.env.JWT_ACCESS_TOKEN_SECRET,
    refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;

const Token = {
    generateTokens: (payload = { email: '' }) => {
        const accessToken = jwt.sign(payload, accessTokenSecret, { expiresIn: '1d' });
        const refreshToken = jwt.sign(payload, refreshTokenSecret, { expiresIn: '1y' });

        return { accessToken, refreshToken };
    },

    generateInviteTokens: (payload = { chat_id: '' }, options = { expiresIn: '1d' }) => {
        const inviteToken = jwt.sign(payload, accessTokenSecret, { expiresIn: options.expiresIn });

        return { inviteToken };
    },

    storeRefreshToken: async (token, userId) => {
        let returnedRefreshToken = await refreshTokenModel.findOne({ user: userId });
        if (!returnedRefreshToken) return await refreshTokenModel.create({ user: userId, token });

        returnedRefreshToken.token = token;

        return await returnedRefreshToken.save();
    },

    verifyAccessToken: async (token) => {
        return jwt.verify(token, accessTokenSecret);
    },

    verifyRefreshToken: async (token) => {
        return jwt.verify(token, refreshTokenSecret);
    },

    findRefreshToken: async (userId, refreshToken) => {
        return await refreshTokenModel.findOne({
            user: userId,
            token: refreshToken,
        });
    },

    updateRefreshToken: async (userId, refreshToken) => {
        const returnedRefreshToken = await refreshTokenModel.findOne({ user: userId });

        returnedRefreshToken.token = refreshToken;
        return await returnedRefreshToken.save();
        // return await refreshTokenModel.findOneAndUpdate(
        //     { user: userId },
        //     { token: refreshToken },
        //     { new: true }
        // );
    },

    removeRefreshToken: async (userId, refreshToken) => {
        return await refreshTokenModel.findOneAndRemove({ user: userId, refreshToken });
    },
};

module.exports = Token;
