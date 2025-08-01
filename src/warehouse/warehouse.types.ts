import { Field, ID, ObjectType } from '@nestjs/graphql';

import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';
import { ProductTypeEnum } from 'src/product/product.static';

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
