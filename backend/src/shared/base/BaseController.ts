/**
 * Base Controller class for standardized request handling
 */

import { Request, Response } from 'express';
import { AppError, isAppError } from '../errors.js';
import { ResponseFormatter } from '../response.js';

export abstract class BaseController {
  private createErrorId(): string {
    return Math.random().toString(36).slice(2, 10);
  }

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
  protected sendError(req: Request, res: Response, error: unknown): Response {
    const errorId = this.createErrorId();
    const meta = { errorId, path: req.originalUrl ?? req.url, method: req.method };

    if (isAppError(error)) {
      const appError = error as AppError;
      console.warn(`[${errorId}] ${req.method} ${meta.path} -> ${appError.statusCode}: ${appError.message}`);
      return res.status(appError.statusCode).json(
        ResponseFormatter.error(appError.message, appError.statusCode, appError.details, meta)
      );
    }

    if (error instanceof Error) {
      console.error(`[${errorId}] ${req.method} ${meta.path} -> 500: ${error.message}\n${error.stack ?? ''}`);
      const isProd = process.env.NODE_ENV === 'production';
      const data = isProd ? undefined : { name: error.name, message: error.message, stack: error.stack };
      const message = isProd ? 'Internal server error' : error.message;
      return res.status(500).json(ResponseFormatter.error(message, 500, data, meta));
    }

    console.error(`[${errorId}] ${req.method} ${meta.path} -> 500: Unknown error`, error);
    return res.status(500).json(ResponseFormatter.error('Unknown error occurred', 500, undefined, meta));
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
      this.sendError(req, res, error);
    }
  }
}
