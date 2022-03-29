class CustomError extends Error {
    constructor(code, status, message) {
        super();
        this.code = code;
        this.status = status;
        this.message = message;
    }

    static badRequest(errorMessage = 'Bad Request', status = 'failed') {
        return new CustomError(400, status, errorMessage);
    }

    static alreadyExists(errorMessage = 'Resource already exists', status = 'failed') {
        return new CustomError(209, status, errorMessage);
    }

    static notFound(errorMessage = 'Resource not found', status = 'failed') {
        return new CustomError(404, status, errorMessage);
    }

    static unAuthorized(errorMessage = `You're not authorized`, status = 'failed') {
        return new CustomError(401, status, errorMessage);
    }

    static serverError(errorMessage = `Internal server error`, status = 'failed') {
        return new CustomError(500, status, errorMessage);
    }
}

module.exports = CustomError;
