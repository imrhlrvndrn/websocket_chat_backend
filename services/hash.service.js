const bcrypt = require('bcryptjs');

const HashService = {
    encrypt: async (data = '') => {
        const salt = await bcrypt.genSalt(12);
        const hashedData = await bcrypt.hash(data, salt);
        return hashedData;
    },

    verify: async (data = '', hashedData = '') => {
        const isValid = await bcrypt.compare(data, hashedData);
        return isValid;
    },
};

module.exports = HashService;
