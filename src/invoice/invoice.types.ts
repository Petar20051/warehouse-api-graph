import {
  Field,
  ID,
  ObjectType,
  registerEnumType,
  Float,
} from '@nestjs/graphql';

import { InvoiceStatus } from './invoice.entity';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';

registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });

@ObjectType()
export class InvoiceType extends BaseObjectType {
  @Field(() => ID)
  orderId!: string;

  @Field()
  invoiceNumber!: string;

  @Field(() => InvoiceStatus)
  status!: InvoiceStatus;

  @Field()
  date!: Date;

  @Field(() => OrderType)
  order!: OrderType;

  @Field(() => Float)
  total!: number;
}
