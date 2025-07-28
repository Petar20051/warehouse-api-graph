import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from 'src/common/types/auth-user';

export const User = createParamDecorator(
  (
    data: keyof AuthUser | undefined,
    ctx: ExecutionContext,
  ): AuthUser[keyof AuthUser] | AuthUser => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    const user = request.user;

    return data ? user[data] : user;
  },
);
