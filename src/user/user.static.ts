import { registerEnumType } from '@nestjs/graphql';
import { z } from 'zod';

export enum UserRole {
  OWNER = 'owner',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
}

registerEnumType(UserRole, {
  name: 'UserRole',
});

export const createUserSchema = z.object({
  fullName: z.string().min(2).max(64),
  email: z.string().email(),
  password: z.string().min(8).max(64),
  role: z.nativeEnum(UserRole),
});

export const updateUserSchema = createUserSchema.partial();
