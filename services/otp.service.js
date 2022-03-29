const Otp = {
    generateOtp: async (min = 1000, max = 9999) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    // sendOtpViaSms,
    // sendOtpViaEmail,
};

module.exports = Otp;
