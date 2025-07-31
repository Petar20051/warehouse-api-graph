import { z } from 'zod';
import {
  Field,
  InputType,
  ObjectType,
  ID,
  Int,
  registerEnumType,
} from '@nestjs/graphql';
import { BaseObjectType } from 'src/common/types/base-object.type';
import {
  CreateOrderItemInFullOrderInput,
  OrderItemType,
} from '../orderItem/orderItem.types';
import { WarehouseType } from '../warehouse/warehouse.types';
import { PartnerType } from '../partner/partner.types';
import { InvoiceType } from '../invoice/invoice.types';

export enum OrderTypeEnum {
  SHIPMENT = 'shipment',
  DELIVERY = 'delivery',
}

registerEnumType(OrderTypeEnum, {
  name: 'OrderTypeEnum',
});

export const createOrderSchema = z.object({
  warehouseId: z.string().uuid(),
  partnerId: z.string().uuid().optional(),
  orderType: z.nativeEnum(OrderTypeEnum),
  notes: z.string().optional(),
  date: z.coerce.date().optional(),
});

export const updateOrderSchema = createOrderSchema.partial();

export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

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

@InputType()
export class CreateOrderInput {
  @Field(() => ID)
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  partnerId?: string;

  @Field(() => OrderTypeEnum)
  orderType!: OrderTypeEnum;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  date?: Date;
}

@InputType()
export class UpdateOrderInput {
  @Field(() => ID, { nullable: true })
  warehouseId?: string;

  @Field(() => ID, { nullable: true })
  partnerId?: string;

  @Field(() => OrderTypeEnum, { nullable: true })
  orderType?: OrderTypeEnum;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  date?: Date;
}

@InputType()
export class TransferProductInput {
  @Field(() => ID)
  productId!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => ID)
  fromWarehouseId!: string;

  @Field(() => ID)
  toWarehouseId!: string;
}

@InputType()
export class CreateOrderWithItemsInput {
  @Field(() => OrderTypeEnum)
  orderType!: OrderTypeEnum;

  @Field(() => ID)
  warehouseId!: string;

  @Field(() => ID, { nullable: true })
  partnerId?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  date?: Date;

  @Field(() => [CreateOrderItemInFullOrderInput])
  orderItems!: CreateOrderItemInFullOrderInput[];
}
