import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common/services/base.service';
import { Partner } from './partner.entity';
import { Order } from '../order/order.entity';
import { TopCustomerResult } from './partner.static';

@Injectable()
export class PartnerService extends BaseService<Partner> {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,

    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super(partnerRepo);
  }

  async getTopCustomerByOrders(
    companyId: string,
  ): Promise<TopCustomerResult | null> {
    const raw = await this.partnerRepo
      .createQueryBuilder('partner')
      .leftJoin('partner.orders', 'order')
      .select('partner.id', 'partnerId')
      .addSelect('partner.name', 'name')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .where('partner.companyId = :companyId', { companyId })
      .andWhere('partner.type = :type', { type: 'customer' })
      .andWhere('order.deletedAt IS NULL')
      .groupBy('partner.id')
      .orderBy('COUNT(order.id)', 'DESC')
      .limit(1)
      .getRawOne<TopCustomerResult>();

    return raw ?? null;
  }
}
