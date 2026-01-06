/**
 * Base Service class for standardized business logic
 */

import { AppError, ValidationError } from '../errors.js';

export abstract class BaseService {
  /**
   * Validate using Zod schema
   */
  protected validate<T>(schema: any, data: unknown): T {
    if (!schema || typeof schema.safeParse !== 'function') {
      throw new AppError('Invalid schema provided', 500);
    }
    const result = schema.safeParse(data);
    if (!result.success) {
      const issues = result.error?.issues ?? result.error?.errors ?? [];
      const errors = issues?.map((err: any) => ({
        field: err.path?.join('.') || 'unknown',
        message: err.message,
      })) || [{ field: 'unknown', message: result.error?.message || 'Validation failed' }];
      console.log(errors);
      throw new ValidationError('Validation failed', errors);
    }
    return result.data as T;
  }

  /**
   * Handle errors in service methods
   */
  protected handleError(error: unknown): never {
    if (error instanceof AppError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new AppError(error.message, 500);
    }
    throw new AppError('Unknown error occurred', 500);
  }

  /**
   * Execute async operation with error handling
   */
  protected async executeWithErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.handleError(error);
    }
  }
}
