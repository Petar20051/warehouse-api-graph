import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import { z } from 'zod';

import { InvoiceStatus } from './invoice.entity';
import { BaseObjectType } from 'src/common/types/base-object.type';
import { OrderType } from 'src/order/order.types';

registerEnumType(InvoiceStatus, { name: 'InvoiceStatus' });

export const createInvoiceSchema = z.object({
  orderId: z.string().uuid(),
  invoiceNumber: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  date: z.coerce.date(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();

export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;

@ObjectType()
export class InvoiceType extends BaseObjectType {
  @Field(() => ID)
  orderId!: string;

  @Field()
  invoiceNumber!: string;

  @Field(() => InvoiceStatus)
  status!: InvoiceStatus;

  @Field()
  date!: Date;

  @Field(() => OrderType)
  order!: OrderType;
}

@InputType()
export class CreateInvoiceInput {
  @Field(() => ID)
  orderId!: string;

  @Field(() => InvoiceStatus)
  status!: InvoiceStatus;

  @Field()
  date!: Date;
}

@InputType()
export class UpdateInvoiceInput {
  @Field(() => ID, { nullable: true })
  orderId?: string;

  @Field({ nullable: true })
  invoiceNumber?: string;

  @Field(() => InvoiceStatus, { nullable: true })
  status?: InvoiceStatus;

  @Field({ nullable: true })
  date?: Date;
}
