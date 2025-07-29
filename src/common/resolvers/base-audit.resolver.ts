import { Resolver, ResolveField, Parent } from '@nestjs/graphql';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { UserService } from 'src/user/user.service';
import { UserType } from 'src/user/user.types';

type Constructor<T = any> = new (...args: any[]) => T;

export function createAuditResolver(returnType: Constructor) {
  @Resolver(() => returnType)
  class AuditResolver {
    constructor(public readonly userService: UserService) {}

    @ResolveField(() => UserType, { nullable: true })
    async modifiedByUser(
      @Parent() entity: { modifiedByUserId: string },
      @CurrentUser('companyId') companyId: string,
    ) {
      if (!entity.modifiedByUserId) return null;
      return this.userService.findOne(entity.modifiedByUserId, companyId);
    }
  }

  return AuditResolver;
}
