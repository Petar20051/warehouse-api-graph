import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthPayloadType {
  @Field() accessToken!: string;
}

@ObjectType()
export class MessagePayload {
  @Field() message!: string;
}
