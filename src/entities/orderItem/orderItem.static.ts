import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
});

export const updateOrderItemSchema = createOrderItemSchema.partial();

export type CreateOrderItemShape = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItemShape = z.infer<typeof updateOrderItemSchema>;

export class CreateOrderItemDto extends createZodDto(createOrderItemSchema) {}
export class UpdateOrderItemDto extends createZodDto(updateOrderItemSchema) {}
