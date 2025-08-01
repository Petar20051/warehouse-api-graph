import { Field, Float, ObjectType } from '@nestjs/graphql';

import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderItemType } from 'src/orderItem/orderItem.types';
import { ProductTypeEnum } from './product.static';

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
