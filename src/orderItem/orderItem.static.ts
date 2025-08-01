import { z } from 'zod';

export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const updateOrderItemSchema = createOrderItemSchema.partial();
