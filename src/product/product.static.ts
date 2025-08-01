import { registerEnumType } from '@nestjs/graphql';
import { z } from 'zod';

export enum ProductTypeEnum {
  SOLID = 'solid',
  LIQUID = 'liquid',
}
registerEnumType(ProductTypeEnum, { name: 'ProductTypeEnum' });

export const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  productType: z.enum(['solid', 'liquid']),
  description: z.string().optional(),
  basePrice: z.number().min(0),
});

export const updateProductSchema = createProductSchema.partial();
