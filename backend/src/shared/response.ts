/**
 * Standardized API response formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  status: number;
  data?: T;
  message?: string;
  timestamp?: string;
}

export class ResponseFormatter {
  /**
   * Format success response
   */
  static success<T>(data: T, message?: string, status: number = 200): ApiResponse<T> {
    return {
      success: true,
      status,
      data,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format error response
   */
  static error(message: string, status: number = 500, data?: any): ApiResponse {
    return {
      success: false,
      status,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format paginated response
   */
  static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): ApiResponse<{ items: T[]; total: number; page: number; limit: number; pages: number }> {
    const pages = Math.ceil(total / limit);
    return {
      success: true,
      status: 200,
      data: {
        items,
        total,
        page,
        limit,
        pages,
      },
      message,
      timestamp: new Date().toISOString(),
    };
  }
}
