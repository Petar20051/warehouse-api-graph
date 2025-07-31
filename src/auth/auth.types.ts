import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { UserRole } from 'src/user/user.types';

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'supersecret',
};

export const AuthMessages = {
  invalidCredentials: 'Invalid email or password',
};

export const registerSchema = z.object({
  companyName: z.string().min(2),
  companyEmail: z.string().email(),
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerUserToCompanySchema = z.object({
  companyId: z.string().uuid(),
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export const changeUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(UserRole),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterUserToCompanyDto = z.infer<
  typeof registerUserToCompanySchema
>;

export class ChangePasswordDto extends createZodDto(changePasswordSchema) {}
export class ChangeUserRoleDto extends createZodDto(changeUserRoleSchema) {}

@InputType()
export class RegisterInput {
  @Field() companyName!: string;
  @Field() companyEmail!: string;
  @Field() fullName!: string;
  @Field() email!: string;
  @Field() password!: string;
}

@InputType()
export class LoginInput {
  @Field() email!: string;
  @Field() password!: string;
}

@InputType()
export class RegisterUserToCompanyInput {
  @Field(() => ID) companyId!: string;
  @Field() fullName!: string;
  @Field() email!: string;
  @Field() password!: string;
}

@InputType()
export class ChangePasswordInput {
  @Field() oldPassword!: string;
  @Field() newPassword!: string;
}

@InputType()
export class ChangeUserRoleInput {
  @Field(() => ID) userId!: string;
  @Field(() => UserRole) role!: UserRole;
}

@ObjectType()
export class AuthPayloadType {
  @Field() accessToken!: string;
}

@ObjectType()
export class MessagePayload {
  @Field() message!: string;
}
