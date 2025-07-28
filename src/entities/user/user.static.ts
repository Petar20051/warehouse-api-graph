export enum UserRole {
  OWNER = 'owner',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(64),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  role: z.nativeEnum(UserRole),
});
export const updateUserSchema = createUserSchema.partial();

export class CreateUserDto extends createZodDto(createUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
