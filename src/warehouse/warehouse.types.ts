import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { z } from 'zod';

import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';
import { ProductTypeEnum } from 'src/product/product.types';

export const createWarehouseSchema = z.object({
  name: z.string().min(2).max(64),
  location: z.string().min(2).max(128),
  supportedType: z.enum(['solid', 'liquid']),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export type CreateWarehouse = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouse = z.infer<typeof updateWarehouseSchema>;

@ObjectType()
export class WarehouseTopStockType {
  @Field(() => ID)
  warehouseId!: string;

  @Field()
  warehouseName!: string;

  @Field(() => ID)
  productId!: string;

  @Field()
  productName!: string;

  @Field()
  stock!: string;
}

@ObjectType()
export class WarehouseType extends BaseObjectType {
  @Field()
  companyId!: string;

  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field(() => ProductTypeEnum)
  supportedType!: ProductTypeEnum;

  @Field(() => [OrderType], { nullable: 'itemsAndList' })
  orders?: OrderType[];
}

@InputType()
export class CreateWarehouseInput {
  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field(() => ProductTypeEnum)
  supportedType!: ProductTypeEnum;
}

@InputType()
export class UpdateWarehouseInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  location?: string;

  @Field(() => ProductTypeEnum, { nullable: true })
  supportedType?: ProductTypeEnum;
}
