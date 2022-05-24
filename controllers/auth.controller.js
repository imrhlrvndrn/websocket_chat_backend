const userDto = require('../dtos/user.dto');
const userModel = require('../models/user.model');
// const {
//     Otp: { generateOtp },
//     Email: { sendEmail },
// } = require('../services');
const { Hash } = require('../services/hash.service');
const {
    badRequest,
    serverError,
    unAuthorized,
    notFound,
} = require('../services/CustomError.service');
const {
    generateTokens,
    storeRefreshToken,
    verifyRefreshToken,
    findRefreshToken,
    updateRefreshToken,
    removeRefreshToken,
} = require('../services/Token.service');
const Cookie = require('../services/cookie.service');
const { uploadFileToCloudinary } = require('../services/cloudinary.service');
const { successResponse } = require('../utils/error.utils');

const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: false,
};
const secureCookieOptions = {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
};

module.exports = {
    registerAccount: async (req, res, next) => {
        const { full_name, email, password } = req.body;
        console.log('File => ', req.file);

        if (!full_name || !email || !password) return next(badRequest(`All fields are required`));

        try {
            const uploadedFile = await uploadFileToCloudinary(req, next);
            let newUser = await userModel.create({
                email,
                full_name,
                password,
                avatar: uploadedFile.secure_url,
            });
            if (!newUser)
                return next(serverError(`We couldn't create an account for you. Please try again`));

            return successResponse(res, {
                data: { user: userDto(newUser) },
            });
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
    loginUser: async (req, res, next) => {
        console.log('User login initiated ... ');
        const { email, password } = req.body;

        if (!email || !password)
            return next(badRequest(`email & password are required for authentication`));

        try {
            const user = await userModel.findOne({ email });
            if (!user) return next(notFound(`User with email ${email} does not exist`));

            const isPasswordValid = await user.validatePassword(password);
            if (!isPasswordValid) return next(badRequest(`Invalid password => ${password}`));

            const { accessToken, refreshToken } = await generateTokens({
                _id: user._id,
                email: user.email,
            });

            // ! See if you want to save the result in a variable and use it in the next step
            await storeRefreshToken(refreshToken, user._id);

            Cookie.set(res, [
                {
                    name: 'X_CHATAPP_ACCESSTOKEN',
                    value: accessToken,
                    options: secureCookieOptions,
                },
                {
                    name: 'X_CHATAPP_REFRESHTOKEN',
                    value: refreshToken,
                    options: secureCookieOptions,
                },
            ]);

            successResponse(res, {
                data: { user: userDto(user), tokens: { accessToken, refreshToken } },
            });
            return;
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
    verifyOtp: async (req, res, next) => {
        const { otp, email, hashedOtp } = req.body;

        if (!otp || !email || !hashedOtp) return next(badRequest());

        const [hash, expires] = hashedOtp.split('@expiresAt');
        if (Date.now() > +expires)
            return next(badRequest(`OTP is expired. Please generate a new one!`));

        const data = `${email}.${otp}.${expires}`;
        const isValidOtp = await Hash.verify(data, hash);

        if (!isValidOtp) return next(badRequest(`OTP is invalid. Please generate a new one!`));

        let user;
        try {
            user = await userModel.findOne({ email });
            // if (!user) user = await createUser({ email });
        } catch (error) {
            console.error(error);
            return next(error);
        }

        const { accessToken, refreshToken } = generateTokens({
            _id: user._id,
            is_activated: false,
        });

        try {
            const savedRefreshToken = await storeRefreshToken(refreshToken, user._id);
            if (!savedRefreshToken) return next(serverError('Error saving refresh token'));
        } catch (error) {
            console.error(error);
            return next(error);
        }

        Cookie.set(res, [
            {
                name: 'X-WHATSAPPCLONE-REFRESHTOKEN',
                value: refreshToken,
                options: secureCookieOptions,
            },
            {
                name: 'X-WHATSAPPCLONE-ACCESSTOKEN',
                value: accessToken,
                options: secureCookieOptions,
            },
            { name: 'isAuthenticated', value: true, options: cookieOptions },
        ]);

        return successResponse(res, {
            data: { user: userDto(user) },
        });
    },
    resetPassword: async (req, res, next) => {
        const { subject, template, variables } = req.body;
        console.log('Hit reset password route', { subject, template, variables });

        try {
            // await sendEmail({ to: 'rahulr1116@gmail.com', subject, template, variables });

            return res.json({ message: 'Please check your email for the password reset link' });
        } catch (error) {
            // if (error.code === 'ENOENT') {
            //     log.error(
            //         `The template with the name ${template} does not exist in templates directory. Please double check the file name or create the file`
            //     );
            // }
            // log.error(`This error occured during sending emails`, error);
            console.log(error);
            return next(error);
        }
    },
    refresh: async (req, res, next) => {
        const { X_CHATAPP_REFRESHTOKEN: refreshTokenFromCookies } = req.cookies;
        // ! Logs
        console.log('Refresh token from Client Cookie => ', refreshTokenFromCookies);
        if (!refreshTokenFromCookies) {
            Cookie.delete(res, ['X_CHATAPP_ACCESSTOKEN', 'X_CHATAPP_REFRESHTOKEN']);

            return next(unAuthorized(`No refresh token received. Please login again`));
        }

        let userData, returnedUser;
        try {
            userData = await verifyRefreshToken(refreshTokenFromCookies);
            // ! Logs
            console.log('decoded user data => ', userData);
        } catch (error) {
            console.error(error);
            return next(error);
        }

        try {
            const returnedRefreshToken = await findRefreshToken(
                userData._id,
                refreshTokenFromCookies
            );
            // ! Logs
            console.log('Found refreshToken in DB => ', returnedRefreshToken);
            if (!returnedRefreshToken) return next(unAuthorized(`Invalid token`));

            returnedUser = await userModel.findOne({ _id: userData._id });
            if (!returnedUser) return next(notFound(`User not found`));
        } catch (error) {
            console.error(error);
            return next(error);
        }

        const { accessToken, refreshToken: newRefreshToken } = generateTokens({
            _id: returnedUser._id,
        });

        try {
            const updatedRefreshToken = await updateRefreshToken(returnedUser._id, newRefreshToken);
            if (!updatedRefreshToken) return next(serverError(`Couldn't update refresh token`));
        } catch (error) {
            console.error(error);
            return next(error);
        }

        Cookie.set(res, [
            {
                name: 'X_CHATAPP_REFRESHTOKEN',
                value: newRefreshToken,
                options: secureCookieOptions,
            },
            { name: 'X_CHATAPP_ACCESSTOKEN', value: accessToken, options: secureCookieOptions },
            // { name: 'isAuthenticated', value: true, options: cookieOptions },
            // { name: 'isActivated', value: returnedUser.is_activated, options: cookieOptions },
        ]);

        return successResponse(res, {
            data: { user: userDto(returnedUser) },
        });
    },
    // ! Only for testing => Just to check if the refresh token is working
    getRefreshToken: async (req, res, next) => {
        const { refreshToken } = req.cookies;

        try {
            const returnedRefreshToken = await findRefreshToken(req.user._id, refreshToken);
            if (!returnedRefreshToken) return next(unAuthorized(`No refresh token found`));

            return successResponse(res, {
                data: {
                    token: returnedRefreshToken,
                },
            });
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
    logoutUser: async (req, res, next) => {
        const { user } = req;
        const { refreshToken } = req.cookies;
        if (!user || !refreshToken) next(badRequest());

        try {
            if (refreshToken) await removeRefreshToken(user._id, refreshToken);
        } catch (error) {
            console.error(error);
            return next(error);
        }

        Cookie.delete(res, [
            'X_CHATAPP_REFRESHTOKEN',
            'X_CHATAPP_ACCESSTOKEN',
            'isAuthenticated',
            'isActivated',
        ]);

        return successResponse(res, { data: { user: null } });
    },
    // ! Only for testing => To be reviewed later
    authenticateUser: async (req, res, next) => {
        try {
            const returnedUser = await userModel.findOne({ _id: req.user._id });
            if (!returnedUser) {
                Cookie.delete(res, [
                    'X_CHATAPP_REFRESHTOKEN',
                    'X_CHATAPP_ACCESSTOKEN',
                    'isAuthenticated',
                    'isActivated',
                ]);
                return next(notFound(`Invalid token. No user found!`));
            }

            res.cookie('isAuthenticated', true, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: false,
            });
            res.cookie('isActivated', returnedUser.is_activated, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: false,
            });

            return successResponse(res, { data: { user: userDto(returnedUser) } });
        } catch (error) {
            console.error(error);
            return next(error);
        }
    },
};
