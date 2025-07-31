import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderItem } from './orderItem.entity';

import { OrderItemService } from './orderItem.service';
import { OrderItemResolver } from './orderItem.resolver';
import { OrderItemAuditResolver } from 'src/common/resolvers/audit-resolvers';

import { OrderModule } from '../order/order.module';
import { ProductModule } from '../product/product.module';
import { UserModule } from '../user/user.module';
import { WarehouseModule } from 'src/warehouse/warehouse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderItem]),
    forwardRef(() => OrderModule),
    forwardRef(() => ProductModule),
    UserModule,
    WarehouseModule,
  ],
  providers: [OrderItemService, OrderItemResolver, OrderItemAuditResolver],
  exports: [OrderItemService],
})
export class OrderItemModule {}
