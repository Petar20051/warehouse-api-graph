import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Warehouse } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';
import { WarehouseController } from './warehouse.resolver';
import { OrderItem } from '../orderItem/orderItem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, OrderItem])],
  providers: [WarehouseService],
  controllers: [WarehouseController],
  exports: [WarehouseService],
})
export class WarehouseModule {}
