import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';
import { z } from 'zod';

export enum PartnerTypeEnum {
  CUSTOMER = 'customer',
  SUPPLIER = 'supplier',
}

registerEnumType(PartnerTypeEnum, {
  name: 'PartnerTypeEnum',
});

export const createPartnerSchema = z.object({
  name: z.string().min(2).max(64),
  type: z.enum(['customer', 'supplier']),
  email: z.string().email(),
  phone: z.string().min(6).max(32),
  address: z.string().min(2).max(128),
});

export const updatePartnerSchema = createPartnerSchema.partial();

export type CreatePartner = z.infer<typeof createPartnerSchema>;
export type UpdatePartner = z.infer<typeof updatePartnerSchema>;

@ObjectType()
export class TopCustomerResultType {
  @Field()
  partnerId!: string;

  @Field()
  name!: string;

  @Field()
  totalOrders!: number;
}

@ObjectType()
export class PartnerType extends BaseObjectType {
  @Field()
  companyId!: string;

  @Field()
  name!: string;

  @Field(() => PartnerTypeEnum)
  type!: PartnerTypeEnum;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => [OrderType], { nullable: 'itemsAndList' })
  orders?: OrderType[];
}

@InputType()
export class CreatePartnerInput {
  @Field()
  name!: string;

  @Field(() => PartnerTypeEnum)
  type!: PartnerTypeEnum;

  @Field()
  email!: string;

  @Field()
  phone!: string;

  @Field()
  address!: string;
}

@InputType()
export class UpdatePartnerInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => PartnerTypeEnum, { nullable: true })
  type?: PartnerTypeEnum;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  address?: string;
}
