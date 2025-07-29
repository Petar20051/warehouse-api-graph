import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { z } from 'zod';

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

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterUserToCompanyDto = z.infer<
  typeof registerUserToCompanySchema
>;

@InputType()
export class RegisterInput {
  @Field()
  companyName!: string;

  @Field()
  companyEmail!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class LoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class RegisterUserToCompanyInput {
  @Field(() => ID)
  companyId!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@ObjectType()
export class AuthPayloadType {
  @Field()
  accessToken!: string;
}

@ObjectType()
export class MessagePayload {
  @Field()
  message!: string;
}
