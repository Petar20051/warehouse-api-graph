import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { createOrderItemSchema } from '../orderItem/orderItem.types';

export const createOrderSchema = z.object({
  warehouseId: z.string().uuid(),
  partnerId: z.string().uuid().optional(),
  orderType: z.enum(['shipment', 'delivery']),
  notes: z.string().optional(),
  date: z.coerce.date().optional(),
});
export const updateOrderSchema = createOrderSchema.partial();

export class CreateOrderDto extends createZodDto(createOrderSchema) {}
export class UpdateOrderDto extends createZodDto(updateOrderSchema) {}

export const createOrderWithItemsSchema = createOrderSchema.extend({
  orderItems: z.array(createOrderItemSchema.omit({ orderId: true })).min(1),
});

export class CreateOrderWithItemsDto extends createZodDto(
  createOrderWithItemsSchema,
) {}

export type CreateOrderWithItemsShape = z.infer<
  typeof createOrderWithItemsSchema
>;
