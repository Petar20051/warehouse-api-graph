import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthUser } from 'src/common/types/auth-user';

interface GqlContext {
  req: {
    user: AuthUser;
  };
}

export const CurrentUser = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): AuthUser =>
    GqlExecutionContext.create(ctx).getContext<GqlContext>().req.user,
) as {
  (): ParameterDecorator;
  <K extends keyof AuthUser>(data: K): ParameterDecorator;
};
