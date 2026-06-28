export class ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  timestamp: string;
  path?: string;
}

export class PaginatedResponse<T = any> extends ApiResponse<T[]> {
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export class ErrorResponse {
  success: boolean = false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}
