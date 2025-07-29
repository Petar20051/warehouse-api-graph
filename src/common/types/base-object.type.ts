import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from 'src/user/user.types';

@ObjectType()
export abstract class BaseObjectType {
  @Field(() => ID)
  id!: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field({ nullable: true })
  modifiedByUserId?: string;

  @Field(() => UserType, { nullable: true })
  modifiedByUser?: UserType;
}
