import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceAuditResolver } from 'src/common/resolvers/audit-resolvers';

import { Order } from 'src/order/order.entity';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { OrderItemModule } from 'src/orderItem/orderItem.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Order]),
    forwardRef(() => OrderModule),
    forwardRef(() => OrderItemModule),
    UserModule,
  ],
  providers: [InvoiceService, InvoiceResolver, InvoiceAuditResolver],
  exports: [InvoiceService],
})
export class InvoiceModule {}
