import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { OrderTypeEnum } from './order.static';
import { CreateOrderItemInFullOrderInput } from 'src/orderItem/orderItem.inputs';

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
