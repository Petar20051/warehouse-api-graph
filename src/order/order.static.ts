import { registerEnumType } from '@nestjs/graphql';
import { z } from 'zod';

export enum OrderTypeEnum {
  SHIPMENT = 'shipment',
  DELIVERY = 'delivery',
}

registerEnumType(OrderTypeEnum, {
  name: 'OrderTypeEnum',
});

export const createOrderSchema = z.object({
  warehouseId: z.string().uuid(),
  partnerId: z.string().uuid().optional(),
  orderType: z.nativeEnum(OrderTypeEnum),
  notes: z.string().optional(),
  date: z.coerce.date().optional(),
});

export const updateOrderSchema = createOrderSchema.partial();
