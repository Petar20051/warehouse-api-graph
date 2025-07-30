import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { Order } from 'src/order/order.entity';
import { CreateInvoiceInput, UpdateInvoiceInput } from './invoice.types';

@Injectable()
export class InvoiceService extends BaseService<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {
    super(invoiceRepo);
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    return this.repo.findOne({
      where: { orderId },
    });
  }

  override async createWithUserContext(
    dto: CreateInvoiceInput,
    user: AuthUser,
  ): Promise<Invoice> {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId, companyId: user.companyId },
    });

    if (!order) {
      throw new ForbiddenException(
        'Order not found or does not belong to your company',
      );
    }

    const entity: Partial<Invoice> = {
      orderId: dto.orderId,
      status: dto.status,
      date: dto.date,
      modifiedByUserId: user.userId,
    };

    return this.repo.save(this.repo.create(entity));
  }

  override async updateWithUserContext(
    id: string,
    dto: UpdateInvoiceInput,
    user: AuthUser,
  ): Promise<Invoice> {
    const existing = await this.repo.findOne({
      where: { id },
    });

    if (!existing) {
      throw new ForbiddenException('Invoice not found');
    }

    const order = await this.orderRepo.findOne({
      where: { id: existing.orderId, companyId: user.companyId },
    });

    if (!order) {
      throw new ForbiddenException(
        'Associated order not found or access denied',
      );
    }

    const updated: Partial<Invoice> = {
      ...dto,
      modifiedByUserId: user.userId,
    };

    Object.assign(existing, updated);
    return this.repo.save(existing);
  }
}
