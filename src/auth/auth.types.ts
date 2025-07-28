import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

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
export class RegisterDto extends createZodDto(registerSchema) {}
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export class LoginDto extends createZodDto(loginSchema) {}
export type LoginInput = z.infer<typeof loginSchema>;

export const registerUserToCompanySchema = z.object({
  companyId: z.string().uuid(),
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
});
export class RegisterUserToCompanyDto extends createZodDto(
  registerUserToCompanySchema,
) {}
export type RegisterUserToCompanyInput = z.infer<
  typeof registerUserToCompanySchema
>;
