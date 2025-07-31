import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Warehouse } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';
import { WarehouseResolver } from './warehouse.resolver';
import { WarehouseAuditResolver } from 'src/common/resolvers/audit-resolvers';

import { OrderItem } from '../orderItem/orderItem.entity';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Warehouse, OrderItem]),
    forwardRef(() => OrderModule),
    UserModule,
  ],
  providers: [WarehouseService, WarehouseResolver, WarehouseAuditResolver],
  exports: [WarehouseService],
})
export class WarehouseModule {}
