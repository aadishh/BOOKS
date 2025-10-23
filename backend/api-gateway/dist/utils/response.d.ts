import { Response } from 'express';
export interface StandardApiResponse<T = any> {
    statusCode: number;
    message: string;
    data: T;
}
export declare class ResponseHandler {
    static success<T>(res: Response, data?: T, message?: string, statusCode?: number): void;
    static error(res: Response, message?: string, statusCode?: number, data?: any): void;
    static created<T>(res: Response, data?: T, message?: string): void;
    static notFound(res: Response, message?: string): void;
    static unauthorized(res: Response, message?: string): void;
    static forbidden(res: Response, message?: string): void;
    static conflict(res: Response, message?: string): void;
    static serverError(res: Response, message?: string): void;
    static badRequest(res: Response, message?: string): void;
    static tooManyRequests(res: Response, message?: string): void;
}
//# sourceMappingURL=response.d.ts.map