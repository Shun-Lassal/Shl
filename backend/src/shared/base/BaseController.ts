/**
 * Base Controller class for standardized request handling
 */

import { Request, Response } from 'express';
import { AppError, isAppError } from '../errors.ts';
import { ResponseFormatter } from '../response.ts';

export abstract class BaseController {
  /**
   * Handle success response
   */
  protected sendSuccess<T>(
    res: Response,
    data: T,
    message?: string,
    statusCode: number = 200
  ): Response {
    return res.status(statusCode).json(ResponseFormatter.success(data, message, statusCode));
  }

  /**
   * Handle error response
   */
  protected sendError(res: Response, error: unknown): Response {
    if (isAppError(error)) {
      const appError = error as AppError;
      return res.status(appError.statusCode).json(
        ResponseFormatter.error(appError.message, appError.statusCode, appError.details)
      );
    }

    if (error instanceof Error) {
      return res.status(500).json(ResponseFormatter.error(error.message, 500));
    }

    return res.status(500).json(ResponseFormatter.error('Unknown error occurred', 500));
  }

  /**
   * Wrap async controller method with error handling
   */
  protected async executeAsync(
    fn: (req: Request, res: Response) => Promise<void>,
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      await fn(req, res);
    } catch (error) {
      this.sendError(res, error);
    }
  }
}
