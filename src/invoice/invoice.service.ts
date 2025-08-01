import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Invoice } from './invoice.entity';
import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { OrderService } from 'src/order/order.service';
import { CreateInvoiceInput, UpdateInvoiceInput } from './invoice.inputs';

@Injectable()
export class InvoiceService extends BaseService<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    invoiceRepo: Repository<Invoice>,
    @Inject(forwardRef(() => OrderService))
    private readonly orderService: OrderService,
  ) {
    super(invoiceRepo);
  }

  async findAllByCompany(companyId: string): Promise<Invoice[]> {
    return this.repo
      .createQueryBuilder('invoice')
      .innerJoin('orders', 'o', 'invoice.order_id = o.id')
      .where('o.company_id = :companyId', { companyId })
      .getMany();
  }

  override async findOne(
    id: string,
    companyId: string,
  ): Promise<Invoice | null> {
    return this.repo
      .createQueryBuilder('invoice')
      .innerJoin('orders', 'o', 'invoice.order_id = o.id')
      .where('invoice.id = :id', { id })
      .andWhere('o.company_id = :companyId', { companyId })
      .getOne();
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    return this.repo.findOne({ where: { orderId } });
  }

  override async createWithUserContext(
    dto: CreateInvoiceInput,
    user: AuthUser,
  ): Promise<Invoice> {
    const order = await this.orderService.findOne(dto.orderId, user.companyId);
    if (!order) {
      throw new ForbiddenException(
        'Order not found or does not belong to your company',
      );
    }

    const invoice = this.repo.create({
      orderId: dto.orderId,
      status: dto.status,
      date: dto.date,
      modifiedByUserId: user.userId,
    });

    return this.repo.save(invoice);
  }

  override async updateWithUserContext(
    id: string,
    dto: UpdateInvoiceInput,
    user: AuthUser,
  ): Promise<Invoice> {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) throw new ForbiddenException('Invoice not found');

    const order = await this.orderService.findOne(
      existing.orderId,
      user.companyId,
    );
    if (!order) {
      throw new ForbiddenException(
        'Associated order not found or access denied',
      );
    }

    Object.assign(existing, {
      ...dto,
      modifiedByUserId: user.userId,
    });

    return this.repo.save(existing);
  }
}
