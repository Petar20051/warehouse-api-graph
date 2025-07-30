import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceStatus } from '../invoice/invoice.entity';
import {
  CreateOrderInput,
  OrderTypeEnum,
  UpdateOrderInput,
} from './order.types';
import { Partner } from '../partner/partner.entity';
import { Warehouse } from '../warehouse/warehouse.entity';
import { ForbiddenError } from 'apollo-server-express';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order)
    repo: Repository<Order>,
    private readonly invoiceService: InvoiceService,
  ) {
    super(repo);
  }

  async findAllByCompany(companyId: string): Promise<Order[]> {
    return this.repo.find({ where: { companyId } });
  }

  async findByWarehouse(
    warehouseId: string,
    companyId: string,
  ): Promise<Order[]> {
    return this.repo.find({
      where: {
        warehouseId,
        companyId,
      },
    });
  }

  async findByPartner(partnerId: string, companyId: string): Promise<Order[]> {
    return this.repo.find({
      where: {
        partnerId,
        companyId,
      },
    });
  }

  override async createWithUserContext(
    dto: CreateOrderInput,
    user: AuthUser,
  ): Promise<Order> {
    const { warehouseId, partnerId, orderType, notes, date } = dto;

    const warehouse = await this.repo.manager.findOne(Warehouse, {
      where: { id: warehouseId, companyId: user.companyId },
    });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found or unauthorized');
    }

    let partner: Partner | null = null;
    if (partnerId) {
      partner = await this.repo.manager.findOne(Partner, {
        where: { id: partnerId, companyId: user.companyId },
      });
      if (!partner) {
        throw new NotFoundException('Partner not found or unauthorized');
      }

      const isValid =
        (orderType === OrderTypeEnum.SHIPMENT && partner.type === 'customer') ||
        (orderType === OrderTypeEnum.DELIVERY && partner.type === 'supplier');

      if (!isValid) {
        throw new BadRequestException(
          `Invalid partner type for orderType '${orderType}'. Shipment requires a customer, delivery requires a supplier.`,
        );
      }
    }

    const created = await super.createWithUserContext(
      {
        warehouseId,
        partnerId,
        notes,
        orderType,
        date: date ?? new Date(),
      },
      user,
    );

    const shouldCreateInvoice =
      partnerId && orderType === OrderTypeEnum.SHIPMENT;

    if (shouldCreateInvoice) {
      await this.invoiceService.createWithUserContext(
        {
          orderId: created.id,
          status: InvoiceStatus.UNPAID,
          date: date ?? new Date(),
        },
        user,
      );
    }

    return this.repo.findOneOrFail({ where: { id: created.id } });
  }

  override async updateWithUserContext(
    id: string,
    dto: Partial<UpdateOrderInput>,
    user: AuthUser,
  ): Promise<Order> {
    const existing = await this.repo.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      throw new ForbiddenError('Order not found or access denied');
    }

    const {
      warehouseId = existing.warehouseId,
      partnerId = existing.partnerId,
      orderType = existing.orderType,
      notes = existing.notes,
      date = existing.date,
    } = { ...existing, ...dto };

    const warehouse = await this.repo.manager.findOne(Warehouse, {
      where: { id: warehouseId, companyId: user.companyId },
    });

    if (!warehouse) {
      throw new NotFoundException('Warehouse not found or unauthorized');
    }

    let partner: Partner | null = null;
    if (partnerId) {
      partner = await this.repo.manager.findOne(Partner, {
        where: { id: partnerId, companyId: user.companyId },
      });

      if (!partner) {
        throw new NotFoundException('Partner not found or unauthorized');
      }

      const isValid =
        (orderType === OrderTypeEnum.SHIPMENT && partner.type === 'customer') ||
        (orderType === OrderTypeEnum.DELIVERY && partner.type === 'supplier');

      if (!isValid) {
        throw new BadRequestException(
          `Invalid partner type for orderType '${orderType}'. Shipment requires a customer, delivery requires a supplier.`,
        );
      }
    }

    Object.assign(existing, {
      warehouseId,
      partnerId,
      notes,
      orderType,
      date,
      modifiedByUserId: user.userId,
    });

    await this.repo.save(existing);
    return this.repo.findOneOrFail({ where: { id: existing.id } });
  }
}
