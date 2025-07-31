import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { z } from 'zod';
import { BaseObjectType } from 'src/common/types/base-object.type';

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

export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

@ObjectType()
export class UserType extends BaseObjectType {
  @Field()
  companyId!: string;

  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field(() => UserRole)
  role!: UserRole;
}

@InputType()
export class CreateUserInput {
  @Field()
  fullName!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field(() => UserRole)
  role!: UserRole;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field(() => UserRole, { nullable: true })
  role?: UserRole;
}
