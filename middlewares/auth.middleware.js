const { verifyAccessToken } = require('../services/Token.service');
const { unAuthorized } = require('../services/CustomError.service');

module.exports = {
    authMiddleware: async (req, res, next) => {
        console.log('Cookies => ', req.cookies);
        try {
            const { X_CHATAPP_ACCESSTOKEN: accessToken } = req.cookies;
            if (!accessToken) return next(unAuthorized(`Invalid token`));

            const userDetails = await verifyAccessToken(accessToken);
            if (!userDetails) return next(unAuthorized(`Token is expired`));

            req.user = userDetails;

            next();
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
};
