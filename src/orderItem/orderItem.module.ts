import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './orderItem.entity';
import { OrderItemService } from './orderItem.service';
import { OrderItemResolver } from './orderItem.resolver';
import { Product } from '../product/product.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { OrderModule } from '../order/order.module';
import { Order } from '../order/order.entity';
import { OrderItemAuditResolver } from 'src/common/resolvers/audit-resolvers';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem, Product, Warehouse, Order]),
    OrderModule,
    forwardRef(() => ProductModule),
    UserModule,
  ],
  providers: [OrderItemService, OrderItemResolver, OrderItemAuditResolver],
  exports: [OrderItemService],
})
export class OrderItemModule {}
