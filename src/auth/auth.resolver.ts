import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { AuthService } from './auth.service';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/currentUser.decorator';

import { AuthPayloadType, MessagePayload } from './auth.types';

import { AuthUser } from 'src/common/types/auth-user';
import { UserRole } from 'src/user/user.static';
import {
  ChangePasswordInput,
  ChangeUserRoleInput,
  LoginInput,
  RegisterInput,
  RegisterUserToCompanyInput,
} from './auth.inputs';
import {
  changePasswordSchema,
  changeUserRoleSchema,
  loginSchema,
  registerSchema,
  registerUserToCompanySchema,
} from './auth.static';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadType, { name: 'RegisterUserAndCompany' })
  async register(
    @Args('input', new ZodValidationPipe(registerSchema))
    input: RegisterInput,
  ): Promise<AuthPayloadType> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayloadType, { name: 'Login' })
  async login(
    @Args('input', new ZodValidationPipe(loginSchema))
    input: LoginInput,
  ): Promise<AuthPayloadType> {
    return this.authService.login(input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Mutation(() => MessagePayload, { name: 'RegisterUserToCompany' })
  async registerUserToCompany(
    @Args('input', new ZodValidationPipe(registerUserToCompanySchema))
    input: RegisterUserToCompanyInput,
  ): Promise<MessagePayload> {
    return this.authService.registerUserToCompany(input);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => MessagePayload, { name: 'ChangePassword' })
  async changePassword(
    @Args('input', new ZodValidationPipe(changePasswordSchema))
    input: ChangePasswordInput,
    @CurrentUser('userId') userId: string,
  ): Promise<MessagePayload> {
    return this.authService.changePassword(userId, input);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Mutation(() => MessagePayload, { name: 'ChangeUserRole' })
  async changeUserRole(
    @Args('input', new ZodValidationPipe(changeUserRoleSchema))
    input: ChangeUserRoleInput,
    @CurrentUser() currentUser: AuthUser,
  ): Promise<MessagePayload> {
    return this.authService.changeUserRole(input, currentUser);
  }
}
