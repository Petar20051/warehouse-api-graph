import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { CUSTOM_MESSAGE_KEY } from '../decorators/custom-message.decorator';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const customMessage =
      this.reflector.get<string>(CUSTOM_MESSAGE_KEY, context.getHandler()) ||
      'OK';

    return next.handle().pipe(
      map((data: T) => ({
        status: 'success',
        data,
        message: customMessage,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
