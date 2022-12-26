const { verifyAccessToken } = require('../services/token.service');
const { unAuthorized } = require('../services/CustomError.service');

module.exports = {
    authMiddleware: async (req, res, next) => {
        try {
            const { X_CHATAPP_ACCESSTOKEN: accessToken } = req.cookies;
            if (!accessToken) return next(unAuthorized(`Invalid token`));

            /*
            A. User makes a request with valid Refresh & Access Token
                1. User gets the requested data
            
            B. User makes a request with valid Refresh token but Access token in expired
                1. The request is invalidated & blocked
                2. The client requests for a new Access token with the Refresh token
                3. User makes the same request again with valid tokens & gets the data

            C. User makes a request with invalid Refresh & Access token
                1. The request is blocked & invalidated
                2. The client requests for a new Access token but the Refresh token is also expired
                * 3. [In refresh func on Line 177 in `auth.controller.js`] The client must be logged out ( Delete auth cookies ) here & redirected to the login screen

            */

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
