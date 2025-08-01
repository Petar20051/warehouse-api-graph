import { z } from 'zod';
import { InvoiceStatus } from './invoice.entity';

export const createInvoiceSchema = z.object({
  orderId: z.string().uuid(),
  invoiceNumber: z.string(),
  status: z.nativeEnum(InvoiceStatus),
  date: z.coerce.date(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial();
