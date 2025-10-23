"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
class ResponseHandler {
    static success(res, data = {}, message = 'success', statusCode = 200) {
        const response = {
            statusCode,
            message,
            data
        };
        res.status(statusCode).json(response);
    }
    static error(res, message = 'error', statusCode = 400, data = {}) {
        const response = {
            statusCode,
            message,
            data
        };
        res.status(statusCode).json(response);
    }
    static created(res, data = {}, message = 'created successfully') {
        this.success(res, data, message, 201);
    }
    static notFound(res, message = 'resource not found') {
        this.error(res, message, 404);
    }
    static unauthorized(res, message = 'unauthorized') {
        this.error(res, message, 401);
    }
    static forbidden(res, message = 'forbidden') {
        this.error(res, message, 403);
    }
    static conflict(res, message = 'conflict') {
        this.error(res, message, 409);
    }
    static serverError(res, message = 'internal server error') {
        this.error(res, message, 500);
    }
    static badRequest(res, message = 'bad request') {
        this.error(res, message, 400);
    }
    static tooManyRequests(res, message = 'too many requests') {
        this.error(res, message, 429);
    }
}
exports.ResponseHandler = ResponseHandler;
//# sourceMappingURL=response.js.map