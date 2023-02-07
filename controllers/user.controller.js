const userModel = require('../models/user.model');
const { serverError, notFound, badRequest } = require('../services/CustomError.service');
const { successResponse } = require('../utils/error.utils');

const searchAllUsers = async (req, res, next) => {
    // ! Fix the filteration part at the end
    const searchQuery = req.query.query
        ? {
              $or: [
                  { full_name: { $regex: `${req.query.query}`, $options: 'i' } },
                  { email: { $regex: `${req.query.query}`, $options: 'i' } },
              ],
          }
        : {};

    try {
        const users = await userModel.find(searchQuery);

        return successResponse(res, {
            data: {
                // ! Use the below commented method to filter the logged in user from the search results
                // users: users.filter((user) => user.email !== req.user.email),
                users,
            },
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

const userBlocking = async (req, res, next) => {
    const { user_id } = req.body;
    const { block_type } = req.params;

    try {
        const returnedUser = await userModel.findOne({ _id: req.user._id });
        if (!returnedUser) return next(notFound(`This user doesn't exist`));

        if (block_type === 'block') returnedUser.blocked = [...returnedUser._doc.blocked, user_id];
        else if (block_type === 'unblock')
            returnedUser.blocked = returnedUser.blocked.filter(
                (id) => id.toString() !== user_id.toString()
            );
        else return next(badRequest(`Please provide a valid action type`));

        await returnedUser.save();
        return successResponse(res, { data: { blocked: returnedUser.blocked } });
    } catch (error) {
        console.error(error);
        return next(serverError(`Couldn't complete user blocking/unblocking action`));
    }
};

module.exports = { searchAllUsers, userBlocking };
