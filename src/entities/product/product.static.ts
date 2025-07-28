import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createProductSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  productType: z.enum(['solid', 'liquid']),
  description: z.string().optional(),
  basePrice: z.number().min(0),
});
export const updateProductSchema = createProductSchema.partial();

export class CreateProductDto extends createZodDto(createProductSchema) {}
export class UpdateProductDto extends createZodDto(updateProductSchema) {}
