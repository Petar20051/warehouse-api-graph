import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserType, CreateUserInput, UpdateUserInput } from './user.types';
import { User } from './user.entity';
import { UserService } from './user.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from './user.types';

import { createUserSchema, updateUserSchema } from './user.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';

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
  override findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @Query(() => UserType, { nullable: true, name: 'getUserById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(id, user);
  }

  //@Mutation(() => UserType, { name: 'createUser' })
  @Roles(UserRole.OWNER)
  override create(
    @Args('input', new ZodValidationPipe(createUserSchema))
    input: CreateUserInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => UserType, { name: 'updateUser' })
  @Roles(UserRole.OWNER)
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
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(id, user);
  }
}
