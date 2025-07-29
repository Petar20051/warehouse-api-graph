import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { BaseService } from 'src/common/services/base.service';
import { InvoiceService } from '../invoice/invoice.service';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    repo: Repository<Order>,
    private readonly invoiceService: InvoiceService,
  ) {
    super(repo);
  }

  async findByPartner(partnerId: string): Promise<Order[]> {
    return this.repo.find({
      where: { partnerId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByWarehouse(warehouseId: string): Promise<Order[]> {
    return this.repo.find({
      where: { warehouseId },
      order: { createdAt: 'DESC' },
    });
  }
}
