import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Partner } from './partner.entity';

import { BaseService } from 'src/common/services/base.service';
import { TopCustomerResultType } from './partner.types';
import { MessagePayload } from 'src/auth/auth.types';
import { AuthUser } from 'src/common/types/auth-user';

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
      .andWhere('partner.deleted_at IS NULL')
      .groupBy('partner.id')
      .orderBy('COUNT(orders.id)', 'DESC')
      .limit(1)
      .getRawOne<TopCustomerResultType>();

    return raw || null;
  }

  override async softDelete(
    id: string,
    user: AuthUser,
  ): Promise<MessagePayload> {
    const partner = await this.findOne(id, user.companyId);

    const orderCount = await this.repo
      .createQueryBuilder('partner')
      .innerJoin('orders', 'o', 'o.partner_id = :partnerId', {
        partnerId: partner?.id,
      })
      .where('partner.id = :id', { id: partner?.id })
      .andWhere('o.deleted_at IS NULL')
      .getCount();

    if (orderCount > 0) {
      throw new BadRequestException(
        'Cannot delete partner: it has associated orders',
      );
    }

    await super.softDelete(id, user);
    return { message: 'Partner deleted successfully' };
  }

  override async hardDelete(
    id: string,
    companyId: string,
  ): Promise<MessagePayload> {
    const partner = await this.findOne(id, companyId);

    const orderCount = await this.repo
      .createQueryBuilder('partner')
      .innerJoin('orders', 'o', 'o.partner_id = :partnerId', {
        partnerId: partner?.id,
      })
      .where('partner.id = :id', { id: partner?.id })
      .getCount();

    if (orderCount > 0) {
      throw new BadRequestException(
        'Cannot hard delete partner: it has associated orders',
      );
    }

    await super.hardDelete(id, companyId);
    return { message: 'Partner hard-deleted successfully' };
  }
}
