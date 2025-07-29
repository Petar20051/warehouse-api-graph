import { Field, Float, InputType, ObjectType, ID } from '@nestjs/graphql';
import { z } from 'zod';

import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';
import { ProductType } from 'src/product/product.types';

export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const updateOrderItemSchema = createOrderItemSchema.partial();

export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItem = z.infer<typeof updateOrderItemSchema>;

@ObjectType()
export class OrderItemType extends BaseObjectType {
  @Field(() => ID)
  orderId!: string;

  @Field(() => ID)
  productId!: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  quantity!: number;

  @Field(() => OrderType)
  order!: OrderType;

  @Field(() => ProductType)
  product!: ProductType;
}

@InputType()
export class CreateOrderItemInput {
  @Field(() => ID)
  orderId!: string;

  @Field(() => ID)
  productId!: string;

  @Field(() => Float)
  unitPrice!: number;

  @Field(() => Float)
  quantity!: number;
}

@InputType()
export class UpdateOrderItemInput {
  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field(() => ID, { nullable: true })
  productId?: string;

  @Field(() => Float, { nullable: true })
  unitPrice?: number;

  @Field(() => Float, { nullable: true })
  quantity?: number;
}
