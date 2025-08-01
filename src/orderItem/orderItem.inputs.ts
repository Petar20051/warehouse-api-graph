import { Field, Float, ID, InputType } from '@nestjs/graphql';

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
export class CreateOrderItemInFullOrderInput {
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
