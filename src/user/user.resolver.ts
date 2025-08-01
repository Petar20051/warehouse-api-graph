import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserType } from './user.types';
import { User } from './user.entity';
import { UserService } from './user.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';
import { CreateUserInput, UpdateUserInput } from './user.inputs';
import { createUserSchema, updateUserSchema, UserRole } from './user.static';

@Resolver(() => UserType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserResolver extends BaseResolver<
  User,
  CreateUserInput,
  UpdateUserInput
> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Query(() => [UserType], { name: 'getAllUsers' })
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => UserType, { nullable: true, name: 'getUserById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Mutation(() => UserType, { name: 'createUser' })
  @Roles(UserRole.OWNER)
  override create(
    @Args('input', new ZodValidationPipe(createUserSchema))
    input: CreateUserInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => UserType, { name: 'updateUser' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateUserSchema))
    input: UpdateUserInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteUser' })
  @Roles(UserRole.OWNER)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteUser' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }
}
