export class ApiResponse<T = any> {
  public statusCode: number;
  public message: string;
  public data: T | null;

  constructor(statusCode: number, message: string, data: T | null = null) {
    this.statusCode = statusCode < 400 ? statusCode : 500;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;