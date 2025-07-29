import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class InvoiceService extends BaseService<Invoice> {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepo: Repository<Invoice>,
  ) {
    super(invoiceRepo);
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    return this.repo.findOne({
      where: { orderId },
    });
  }
}
