import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Partner } from './partner.entity';
import { Order } from '../order/order.entity';

import { BaseService } from 'src/common/services/base.service';
import { TopCustomerResultType } from './partner.types';

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
  ): Promise<TopCustomerResultType | null> {
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
      .getRawOne<TopCustomerResultType>();

    return raw || null;
  }
}
