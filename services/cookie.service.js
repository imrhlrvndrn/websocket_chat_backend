const cookie = {
    set: (res, cookies = [{ name: 'DEFAULT_COOKIE', value: 'default value', options: {} }]) => {
        return cookies.forEach(({ name, value, options }) => res.cookie(name, value, options));
    },

    delete: (res, cookies = ['DEFAULT_COOKIE']) => {
        return cookies.forEach((cookie) => res.clearCookie(cookie));
    },
};

module.exports = cookie;
