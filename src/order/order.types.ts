import { Field, ObjectType, ID } from '@nestjs/graphql';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderItemType } from '../orderItem/orderItem.types';
import { WarehouseType } from '../warehouse/warehouse.types';
import { PartnerType } from '../partner/partner.types';
import { InvoiceType } from '../invoice/invoice.types';
import { OrderTypeEnum } from './order.static';

@ObjectType()
export class OrderType extends BaseObjectType {
  @Field()
  companyId!: string;

  @Field(() => ID, { nullable: true })
  partnerId?: string;

  @Field(() => ID)
  warehouseId!: string;

  @Field(() => OrderTypeEnum)
  orderType!: OrderTypeEnum;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  date!: Date;

  @Field(() => WarehouseType)
  warehouse!: WarehouseType;

  @Field(() => PartnerType, { nullable: true })
  partner?: PartnerType;

  @Field(() => [OrderItemType], { nullable: 'itemsAndList' })
  orderItems?: OrderItemType[];

  @Field(() => InvoiceType, { nullable: true })
  invoice?: InvoiceType;
}
