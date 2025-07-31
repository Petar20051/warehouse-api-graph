import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceResolver } from './invoice.resolver';
import { InvoiceAuditResolver } from 'src/common/resolvers/audit-resolvers';

import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';
import { OrderItemModule } from 'src/orderItem/orderItem.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
    forwardRef(() => OrderModule),
    forwardRef(() => OrderItemModule),
    UserModule,
  ],
  providers: [InvoiceService, InvoiceResolver, InvoiceAuditResolver],
  exports: [InvoiceService],
})
export class InvoiceModule {}
