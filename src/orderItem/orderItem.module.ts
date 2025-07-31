import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from './orderItem.entity';
import { Order } from '../order/order.entity';
import { Product } from '../product/product.entity';
import { Warehouse } from '../warehouse/warehouse.entity';

import { OrderItemService } from './orderItem.service';
import { OrderItemResolver } from './orderItem.resolver';
import { OrderItemAuditResolver } from 'src/common/resolvers/audit-resolvers';

import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Order, Product, Warehouse]),
    OrderModule,
    forwardRef(() => ProductModule),
    UserModule,
  ],
  providers: [OrderItemService, OrderItemResolver, OrderItemAuditResolver],
  exports: [OrderItemService],
})
export class OrderItemModule {}
