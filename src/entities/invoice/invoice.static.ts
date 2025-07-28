import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { InvoiceStatus } from './invoice.entity';

export const createInvoiceSchema = z.object({
  orderId: z.string().uuid(),
  invoiceNumber: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  date: z.coerce.date(),
});
export const updateInvoiceSchema = createInvoiceSchema.partial();

export class CreateInvoiceDto extends createZodDto(createInvoiceSchema) {}
export class UpdateInvoiceDto extends createZodDto(updateInvoiceSchema) {}
