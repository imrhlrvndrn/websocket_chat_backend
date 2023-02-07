const router = require('express').Router();

// middlewares
const { authMiddleware } = require('../middlewares/auth.middleware');
const { uploadFileWithMulter } = require('../middlewares/multer.middleware');

// controllers
const {
    registerAccount,
    loginUser,
    sendOtp,
    addUser,
    refresh,
    verifyOtp,
    logoutUser,
    resetPassword,
    getRefreshToken,
    authenticateUser,
} = require('../controllers/auth.controller');

// router.get('/authenticate-user', authMiddleware, authenticateUser);

// router.post('/send-otp', sendOtp);

// router.post('/verify-otp', verifyOtp);

router.post('/register', uploadFileWithMulter.single('uploadedFile'), registerAccount);

router.post('/login', loginUser);
router.get('/refresh', refresh);
// // * Temp for now, implement in-depth later
// router.post('/reset-p', resetPassword);
router.post('/logout', logoutUser);
// // !Temp route
// router.post('/create', addUser);
// router.get('/refreshtoken', getRefreshToken);

module.exports = { authRoutes: router };
