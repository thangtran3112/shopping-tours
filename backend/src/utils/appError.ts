class AppError extends Error {
  readonly status: string;
  readonly statusCode: number;
  readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    //if we reach here, the error is an operational error. Otherwise, it was failing for not known reason
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
