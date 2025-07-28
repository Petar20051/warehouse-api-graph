import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './orderItem.entity';
import { OrderItemService } from './orderItem.service';
import { OrderItemController } from './orderItem.controller';
import { Product } from '../product/product.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { OrderModule } from '../order/order.module';
import { Order } from '../order/order.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Product, Warehouse, Order]),
    OrderModule,
  ],
  providers: [OrderItemService],
  controllers: [OrderItemController],
  exports: [OrderItemService],
})
export class OrderItemModule {}
