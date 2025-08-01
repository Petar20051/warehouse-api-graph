import { Field, InputType } from '@nestjs/graphql';
import { UserRole } from './user.static';

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
}
