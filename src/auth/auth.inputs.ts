import { Field, ID, InputType } from '@nestjs/graphql';
import { UserRole } from 'src/user/user.static';

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
