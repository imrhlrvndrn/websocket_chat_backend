const userDto = (user) => {
    return {
        _id: user._id,
        email: user.email,
        avatar: user.avatar,
        full_name: user.full_name,
        created_at: user.createdAt,
    };
};

module.exports = userDto;
