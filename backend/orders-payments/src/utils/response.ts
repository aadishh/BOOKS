import { Response } from 'express';

export interface StandardApiResponse<T = any> {
  statusCode: number;
  message: string;
  data: T;
}

export class ResponseHandler {
  static success<T>(res: Response, data: T = {} as T, message: string = 'success', statusCode: number = 200): void {
    const response: StandardApiResponse<T> = {
      statusCode,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  static error(res: Response, message: string = 'error', statusCode: number = 400, data: any = {}): void {
    const response: StandardApiResponse = {
      statusCode,
      message,
      data
    };
    res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T = {} as T, message: string = 'created successfully'): void {
    this.success(res, data, message, 201);
  }

  static notFound(res: Response, message: string = 'resource not found'): void {
    this.error(res, message, 404);
  }

  static unauthorized(res: Response, message: string = 'unauthorized'): void {
    this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = 'forbidden'): void {
    this.error(res, message, 403);
  }

  static conflict(res: Response, message: string = 'conflict'): void {
    this.error(res, message, 409);
  }

  static serverError(res: Response, message: string = 'internal server error'): void {
    this.error(res, message, 500);
  }

  static badRequest(res: Response, message: string = 'bad request'): void {
    this.error(res, message, 400);
  }

  static tooManyRequests(res: Response, message: string = 'too many requests'): void {
    this.error(res, message, 429);
  }
}