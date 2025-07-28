export type TopCustomerResult = {
  partnerId: string;
  name: string;
  totalOrders: number;
};

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createPartnerSchema = z.object({
  name: z.string().min(2).max(64),
  type: z.enum(['customer', 'supplier']),
  email: z.string().email(),
  phone: z.string().min(6).max(32),
  address: z.string().min(2).max(128),
});
export const updatePartnerSchema = createPartnerSchema.partial();

export class CreatePartnerDto extends createZodDto(createPartnerSchema) {}
export class UpdatePartnerDto extends createZodDto(updatePartnerSchema) {}
