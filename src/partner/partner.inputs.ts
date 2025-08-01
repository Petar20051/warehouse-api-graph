import { Field, InputType } from '@nestjs/graphql';
import { PartnerTypeEnum } from './partner.static';

@InputType()
export class CreatePartnerInput {
  @Field()
  name!: string;

  @Field(() => PartnerTypeEnum)
  type!: PartnerTypeEnum;

  @Field()
  email!: string;

  @Field()
  phone!: string;

  @Field()
  address!: string;
}

@InputType()
export class UpdatePartnerInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => PartnerTypeEnum, { nullable: true })
  type?: PartnerTypeEnum;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;
}
