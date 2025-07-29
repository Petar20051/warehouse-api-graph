import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  RegisterInput,
  LoginInput,
  RegisterUserToCompanyInput,
  AuthPayloadType,
  MessagePayload,
  registerSchema,
  loginSchema,
  registerUserToCompanySchema,
} from './auth.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UserRole } from 'src/user/user.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayloadType)
  async register(
    @Args('input', new ZodValidationPipe(registerSchema))
    input: RegisterInput,
  ) {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayloadType)
  async login(
    @Args('input', new ZodValidationPipe(loginSchema))
    input: LoginInput,
  ) {
    return this.authService.login(input);
  }

  @Mutation(() => MessagePayload)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async registerUser(
    @Args('input', new ZodValidationPipe(registerUserToCompanySchema))
    input: RegisterUserToCompanyInput,
  ) {
    return this.authService.registerUserToCompany(input);
  }
}
