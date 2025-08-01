import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { UserRole } from './user.static';

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
