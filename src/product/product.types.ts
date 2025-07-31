import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { z } from 'zod';

import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderItemType } from 'src/orderItem/orderItem.types';

export enum ProductTypeEnum {
  SOLID = 'solid',
  LIQUID = 'liquid',
}
registerEnumType(ProductTypeEnum, { name: 'ProductTypeEnum' });

export const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  productType: z.enum(['solid', 'liquid']),
  description: z.string().optional(),
  basePrice: z.number().min(0),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;

@ObjectType()
export class ProductType extends BaseObjectType {
  @Field()
  companyId!: string;

  @Field()
  name!: string;

  @Field()
  sku!: string;

  @Field(() => ProductTypeEnum)
  productType!: ProductTypeEnum;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  basePrice!: number;

  @Field(() => [OrderItemType], { nullable: 'itemsAndList' })
  orderItems?: OrderItemType[];
}

@ObjectType()
export class BestSellingProductType {
  @Field()
  productId!: string;

  @Field()
  title!: string;

  @Field()
  totalSold!: string;
}

@InputType()
export class CreateProductInput {
  @Field()
  name!: string;

  @Field()
  sku!: string;

  @Field(() => ProductTypeEnum)
  productType!: ProductTypeEnum;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  basePrice!: number;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => ProductTypeEnum, { nullable: true })
  productType?: ProductTypeEnum;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  basePrice?: number;
}
