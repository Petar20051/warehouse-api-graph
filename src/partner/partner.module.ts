import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Partner } from './partner.entity';
import { PartnerService } from './partner.service';
import { PartnerResolver } from './partner.resolver';
import { Order } from '../order/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, Order])],
  providers: [PartnerService, PartnerResolver],
  exports: [PartnerService],
})
export class PartnerModule {}
