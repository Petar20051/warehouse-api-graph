import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { z } from 'zod';

import { BaseObjectType } from 'src/common/types/base-object.type';
import { UserType } from 'src/user/user.types';
import { ProductType } from 'src/product/product.types';
import { WarehouseType } from 'src/warehouse/warehouse.types';
import { PartnerType } from 'src/partner/partner.types';
import { OrderType } from 'src/order/order.types';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(64),
  email: z.string().email(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompany = z.infer<typeof createCompanySchema>;
export type UpdateCompany = z.infer<typeof updateCompanySchema>;

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

@InputType()
export class CreateCompanyInput {
  @Field()
  name!: string;

  @Field()
  email!: string;
}

@InputType()
export class UpdateCompanyInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;
}
