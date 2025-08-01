import { z } from 'zod';

export const createWarehouseSchema = z.object({
  name: z.string().min(2).max(64),
  location: z.string().min(2).max(128),
  supportedType: z.enum(['solid', 'liquid']),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();
