export abstract class ErrorResponse extends Error {
  public readonly status: number;
  public readonly message: string;

  constructor(message: string, status?: number) {
    super();
    this.message = message;
    this.status = status;
  }
}

export class ValidationError extends ErrorResponse {
  constructor(message: string) {
    super(message, 400);
  }
}

export class BusinessError extends ErrorResponse {
}