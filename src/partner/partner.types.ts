import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';
import { PartnerTypeEnum } from './partner.static';

@ObjectType()
export class PartnerType extends BaseObjectType {
  @Field()
  companyId!: string;

  @Field()
  name!: string;

  @Field(() => PartnerTypeEnum)
  type!: PartnerTypeEnum;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => [OrderType], { nullable: 'itemsAndList' })
  orders?: OrderType[];
}

@ObjectType()
export class TopCustomerResultType {
  @Field(() => ID)
  partnerId!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  totalOrders!: number;
}
