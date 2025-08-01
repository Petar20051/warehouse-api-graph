import { Field, ID, InputType } from '@nestjs/graphql';
import { InvoiceStatus } from './invoice.entity';

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
