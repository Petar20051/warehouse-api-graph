import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { OrderItem } from '../orderItem/orderItem.entity';
import { Order } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderItem, Order])],
  providers: [ProductService, ProductResolver],
  exports: [ProductService],
})
export class ProductModule {}
