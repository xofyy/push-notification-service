import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const timestamp = new Date().toISOString();
    const path = request?.url;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as any;
      const message = res?.message || exception.message;
      const error = res?.error || exception.name;
      const code = res?.code;

      response.status(status).json({
        statusCode: status,
        error,
        message,
        code,
        timestamp,
        path,
      });
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      (exception as any)?.message || 'Internal server error';

    response.status(status).json({
      statusCode: status,
      error: 'InternalServerError',
      message,
      timestamp,
      path,
    });
  }
}

