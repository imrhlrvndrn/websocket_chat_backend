const userModel = require('../models/user.model');
const { serverError } = require('../services/CustomError.service');
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

module.exports = { searchAllUsers };
