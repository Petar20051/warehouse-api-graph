import { registerEnumType } from '@nestjs/graphql';
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
