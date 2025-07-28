export type WarehouseTopStock = {
  warehouseId: string;
  warehouseName: string;
  productId: string;
  productName: string;
  stock: string;
};

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createWarehouseSchema = z.object({
  name: z
    .string({
      required_error: 'Warehouse name is required',
      invalid_type_error: 'Warehouse name must be a string',
    })
    .min(2, 'Warehouse name must be at least 2 characters')
    .max(64, 'Warehouse name must be at most 64 characters'),

  location: z
    .string({
      required_error: 'Location is required',
      invalid_type_error: 'Location must be a string',
    })
    .min(2, 'Location must be at least 2 characters')
    .max(128, 'Location must be at most 128 characters'),

  supportedType: z.enum(['solid', 'liquid'], {
    required_error: 'Supported type is required',
    invalid_type_error: 'Supported type must be either "solid" or "liquid"',
  }),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export class CreateWarehouseDto extends createZodDto(createWarehouseSchema) {}
export class UpdateWarehouseDto extends createZodDto(updateWarehouseSchema) {}
