import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenError } from 'apollo-server-express';

import { Order } from './order.entity';
import { Partner } from '../partner/partner.entity';
import { Warehouse } from '../warehouse/warehouse.entity';

import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceStatus } from '../invoice/invoice.entity';
import {
  CreateOrderInput,
  CreateOrderWithItemsInput,
  OrderTypeEnum,
  UpdateOrderInput,
} from './order.types';
import { OrderItemService } from 'src/orderItem/orderItem.service';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order) repo: Repository<Order>,
    private readonly invoiceService: InvoiceService,
    private readonly orderItemService: OrderItemService,
  ) {
    super(repo);
  }

  async findAllByCompany(companyId: string): Promise<Order[]> {
    return this.repo.find({ where: { companyId } });
  }

  async findByWarehouse(warehouseId: string, companyId: string) {
    return this.repo.find({ where: { warehouseId, companyId } });
  }

  async findByPartner(partnerId: string, companyId: string) {
    return this.repo.find({ where: { partnerId, companyId } });
  }

  override async createWithUserContext(
    dto: CreateOrderInput,
    user: AuthUser,
  ): Promise<Order> {
    const { warehouseId, partnerId, orderType, notes, date } = dto;

    await this.getWarehouseOrFail(warehouseId, user.companyId);

    if (partnerId) {
      await this.validatePartner(partnerId, orderType, user.companyId);
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

    if (partnerId && orderType === OrderTypeEnum.SHIPMENT) {
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
    if (!existing) throw new ForbiddenError('Order not found or access denied');

    const {
      warehouseId = existing.warehouseId,
      partnerId = existing.partnerId,
      orderType = existing.orderType,
      notes = existing.notes,
      date = existing.date,
    } = { ...existing, ...dto };

    await this.getWarehouseOrFail(warehouseId, user.companyId);

    if (partnerId) {
      await this.validatePartner(partnerId, orderType, user.companyId);
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

  async transferProductBetweenWarehouses(
    productId: string,
    quantity: number,
    fromWarehouseId: string,
    toWarehouseId: string,
    user: AuthUser,
  ): Promise<{ shipmentId: string; deliveryId: string }> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than zero.');
    }

    if (fromWarehouseId === toWarehouseId) {
      throw new BadRequestException(
        'Source and destination must be different.',
      );
    }

    const fromWarehouse = await this.getWarehouseOrFail(
      fromWarehouseId,
      user.companyId,
      'Source',
    );
    const toWarehouse = await this.getWarehouseOrFail(
      toWarehouseId,
      user.companyId,
      'Destination',
    );

    const shipment = await super.createWithUserContext(
      {
        warehouseId: fromWarehouseId,
        orderType: OrderTypeEnum.SHIPMENT,
        notes: `Internal transfer to ${toWarehouse.name}`,
        date: new Date(),
      },
      user,
    );

    await this.orderItemService.createWithUserContext(
      {
        orderId: shipment.id,
        productId,
        quantity,
        unitPrice: 0,
      },
      user,
    );

    const delivery = await super.createWithUserContext(
      {
        warehouseId: toWarehouseId,
        orderType: OrderTypeEnum.DELIVERY,
        notes: `Internal transfer from ${fromWarehouse.name}`,
        date: new Date(),
      },
      user,
    );

    await this.orderItemService.createWithUserContext(
      {
        orderId: delivery.id,
        productId,
        quantity,
        unitPrice: 0,
      },
      user,
    );

    return { shipmentId: shipment.id, deliveryId: delivery.id };
  }

  async createFullOrder(
    dto: CreateOrderWithItemsInput,
    user: AuthUser,
  ): Promise<Order | null> {
    const order = await this.createWithUserContext(
      {
        orderType: dto.orderType,
        warehouseId: dto.warehouseId,
        partnerId: dto.partnerId,
        notes: dto.notes,
        date: dto.date,
      },
      user,
    );

    for (const item of dto.orderItems) {
      await this.orderItemService.createWithUserContext(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        },
        user,
      );
    }

    return this.findOne(order.id, user.companyId);
  }

  private async getWarehouseOrFail(
    warehouseId: string,
    companyId: string,
    label: 'Source' | 'Destination' = 'Source',
  ): Promise<Warehouse> {
    const warehouse = await this.repo.manager.findOne(Warehouse, {
      where: { id: warehouseId, companyId },
    });
    if (!warehouse) {
      throw new NotFoundException(
        `${label} warehouse not found or unauthorized`,
      );
    }
    return warehouse;
  }

  private async validatePartner(
    partnerId: string,
    orderType: OrderTypeEnum,
    companyId: string,
  ): Promise<Partner> {
    const partner = await this.repo.manager.findOne(Partner, {
      where: { id: partnerId, companyId },
    });

    if (!partner) {
      throw new NotFoundException('Partner not found or unauthorized');
    }

    const valid =
      (orderType === OrderTypeEnum.SHIPMENT && partner.type === 'customer') ||
      (orderType === OrderTypeEnum.DELIVERY && partner.type === 'supplier');

    if (!valid) {
      throw new BadRequestException(
        `Invalid partner type for '${orderType}'. Shipment → customer, Delivery → supplier.`,
      );
    }

    return partner;
  }
}
