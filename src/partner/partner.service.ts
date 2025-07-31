import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Partner } from './partner.entity';

import { BaseService } from 'src/common/services/base.service';
import { TopCustomerResultType } from './partner.types';

@Injectable()
export class PartnerService extends BaseService<Partner> {
  constructor(
    @InjectRepository(Partner)
    private readonly partnerRepo: Repository<Partner>,
  ) {
    super(partnerRepo);
  }

  async getTopCustomerByOrders(
    companyId: string,
  ): Promise<TopCustomerResultType | null> {
    const raw = await this.partnerRepo
      .createQueryBuilder('partner')
      .leftJoin('orders', 'orders', 'orders.partner_id = partner.id')
      .select('partner.id', 'partnerId')
      .addSelect('partner.name', 'name')
      .addSelect('COUNT(orders.id)', 'totalOrders')
      .where('partner.company_id = :companyId', { companyId })
      .andWhere('partner.type = :type', { type: 'customer' })
      .andWhere('orders.deleted_at IS NULL')
      .groupBy('partner.id')
      .orderBy('COUNT(orders.id)', 'DESC')
      .limit(1)
      .getRawOne<TopCustomerResultType>();

    return raw || null;
  }
}
