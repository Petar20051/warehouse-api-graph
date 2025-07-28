import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ZodValidationException } from 'nestjs-zod';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof ZodValidationException) {
      status = HttpStatus.BAD_REQUEST;
      message = this.formatZodIssues(exception.getZodError());
    } else if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      message = this.formatZodIssues(exception);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();

      if (
        typeof responseBody === 'object' &&
        responseBody !== null &&
        'message' in responseBody
      ) {
        const msg = (responseBody as { message?: unknown }).message;

        if (msg instanceof ZodError) {
          message = this.formatZodIssues(msg);
        } else if (typeof msg === 'string' || Array.isArray(msg)) {
          message = msg;
        }
      } else if (typeof responseBody === 'string') {
        message = responseBody;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.error('[Exception]', exception);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }

  private formatZodIssues(error: ZodError): string[] {
    return error.issues.map((issue) => {
      const path = issue.path.join('.') || 'field';
      return `${path}: ${issue.message}`;
    });
  }
}
