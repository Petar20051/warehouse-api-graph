import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { InvoiceModule } from '../invoice/invoice.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), InvoiceModule],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}
