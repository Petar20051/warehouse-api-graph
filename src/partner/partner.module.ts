import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './partner.entity';
import { PartnerService } from './partner.service';
import { PartnerResolver } from './partner.resolver';
import { Order } from '../order/order.entity';
import { PartnerAuditResolver } from 'src/common/resolvers/audit-resolvers';
import { OrderModule } from 'src/order/order.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner, Order]),
    forwardRef(() => OrderModule),
    UserModule,
  ],
  providers: [PartnerService, PartnerResolver, PartnerAuditResolver],
  exports: [PartnerService],
})
export class PartnerModule {}
