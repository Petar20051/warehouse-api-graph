import { createZodDto } from 'nestjs-zod';
import { UserRole } from 'src/user/user.static';
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
