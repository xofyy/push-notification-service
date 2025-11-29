import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const timestamp = new Date().toISOString();
    const path = request?.url;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();

      let message: string | string[];
      let error: string;
      let code: string | undefined;

      if (typeof res === 'string') {
        message = res;
        error = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        message = (resObj.message as string | string[]) || exception.message;
        error = (resObj.error as string) || exception.name;
        code = resObj.code as string | undefined;
      } else {
        message = exception.message;
        error = exception.name;
      }

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

    // Log the actual error for internal server errors
    this.logger.error(
      `Internal Server Error: ${exception instanceof Error ? exception.message : String(exception)}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message = 'Internal server error';

    response.status(status).json({
      statusCode: status,
      error: 'InternalServerError',
      message,
      timestamp,
      path,
    });
  }
}

