import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { InvoiceModule } from '../invoice/invoice.module';
import { OrderAuditResolver } from 'src/common/resolvers/audit-resolvers';
import { WarehouseModule } from 'src/warehouse/warehouse.module';
import { PartnerModule } from 'src/partner/partner.module';
import { OrderItemModule } from 'src/orderItem/orderItem.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    InvoiceModule,
    forwardRef(() => WarehouseModule),
    forwardRef(() => PartnerModule),
    forwardRef(() => OrderItemModule),
    UserModule,
  ],
  providers: [OrderService, OrderResolver, OrderAuditResolver],
  exports: [OrderService],
})
export class OrderModule {}
