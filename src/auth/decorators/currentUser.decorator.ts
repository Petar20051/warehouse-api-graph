import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthUser } from 'src/common/types/auth-user';

interface GqlContext {
  req: {
    user: AuthUser;
  };
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): any => {
    const user =
      GqlExecutionContext.create(ctx).getContext<GqlContext>().req.user;
    return data ? user[data] : user;
  },
) as {
  (): ParameterDecorator;
  <K extends keyof AuthUser>(data: K): ParameterDecorator;
};
