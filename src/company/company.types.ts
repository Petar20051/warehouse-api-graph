import { Field, ObjectType } from '@nestjs/graphql';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { UserType } from 'src/user/user.types';
import { ProductType } from 'src/product/product.types';
import { WarehouseType } from 'src/warehouse/warehouse.types';
import { PartnerType } from 'src/partner/partner.types';
import { OrderType } from 'src/order/order.types';

@ObjectType()
export class CompanyType extends BaseObjectType {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field(() => [UserType], { nullable: 'itemsAndList' })
  users?: UserType[];

  @Field(() => [ProductType], { nullable: 'itemsAndList' })
  products?: ProductType[];

  @Field(() => [WarehouseType], { nullable: 'itemsAndList' })
  warehouses?: WarehouseType[];

  @Field(() => [PartnerType], { nullable: 'itemsAndList' })
  partners?: PartnerType[];

  @Field(() => [OrderType], { nullable: 'itemsAndList' })
  orders?: OrderType[];
}
