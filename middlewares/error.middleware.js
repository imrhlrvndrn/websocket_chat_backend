const { JsonWebTokenError } = require('jsonwebtoken');
const CustomError = require('../services/CustomError.service');
const { errorResponse } = require('../utils/error.utils');

module.exports = {
    errorMiddleware: (err, req, res, next) => {
        let data = {
            code: 500,
            status: 'failed',
            message: 'Something went wrong on the server ;(',
        };

        if (err instanceof JsonWebTokenError) {
            data = {
                code: 401,
                status: err.status,
                message: err.message,
            };
        } else if (err instanceof CustomError) {
            data = {
                code: err.code,
                status: err.status,
                message: err.message,
            };
        }

        return errorResponse(res, data);
    },
};
