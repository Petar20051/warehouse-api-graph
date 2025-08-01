import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenError } from 'apollo-server-express';

import { Order } from './order.entity';
import { BaseService } from 'src/common/services/base.service';
import { AuthUser } from 'src/common/types/auth-user';
import { InvoiceService } from '../invoice/invoice.service';
import { InvoiceStatus } from '../invoice/invoice.entity';
import { OrderItemService } from 'src/orderItem/orderItem.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { PartnerService } from '../partner/partner.service';
import { DataSource } from 'typeorm';
import { OrderTypeEnum } from './order.static';
import {
  CreateOrderInput,
  CreateOrderWithItemsInput,
  UpdateOrderInput,
} from './order.inputs';

@Injectable()
export class OrderService extends BaseService<Order> {
  constructor(
    @InjectRepository(Order) repo: Repository<Order>,
    private readonly invoiceService: InvoiceService,
    private readonly orderItemService: OrderItemService,
    private readonly warehouseService: WarehouseService,
    private readonly partnerService: PartnerService,
    private readonly dataSource: DataSource,
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

    await this.warehouseService.findOne(warehouseId, user.companyId);

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
    const existing: Order | null = await this.repo.findOne({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      throw new ForbiddenError('Order not found or access denied');
    }

    const warehouseId = dto.warehouseId ?? existing.warehouseId;
    const partnerId = dto.partnerId ?? existing.partnerId;
    const orderType = dto.orderType ?? existing.orderType;
    const notes = dto.notes ?? existing.notes;
    const date = dto.date ?? existing.date;

    if (dto.warehouseId && dto.warehouseId !== existing.warehouseId) {
      await this.warehouseService.findOne(dto.warehouseId, user.companyId);
    }

    if (dto.partnerId && dto.partnerId !== existing.partnerId) {
      if (!orderType) {
        throw new Error('Order type must be defined to validate partner');
      }
      await this.validatePartner(dto.partnerId, orderType, user.companyId);
    }

    Object.assign(existing, {
      warehouseId,
      partnerId,
      orderType,
      notes,
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
    if (fromWarehouseId === toWarehouseId) {
      throw new BadRequestException(
        'Source and destination must be different.',
      );
    }

    return this.dataSource.transaction(async () => {
      const fromWarehouse = await this.warehouseService.findOne(
        fromWarehouseId,
        user.companyId,
      );
      const toWarehouse = await this.warehouseService.findOne(
        toWarehouseId,
        user.companyId,
      );
      if (fromWarehouse?.supportedType !== toWarehouse?.supportedType) {
        throw new BadRequestException(
          'Source and destination must be different.',
        );
      }
      const shipment = await this.createWithUserContext(
        {
          warehouseId: fromWarehouseId,
          orderType: OrderTypeEnum.SHIPMENT,
          notes: `Internal transfer to ${toWarehouse?.name ?? 'unknown warehouse'}`,
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

      const delivery = await this.createWithUserContext(
        {
          warehouseId: toWarehouseId,
          orderType: OrderTypeEnum.DELIVERY,
          notes: `Internal transfer from ${fromWarehouse?.name ?? 'unknown warehouse'}`,
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
    });
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

  private async validatePartner(
    partnerId: string,
    orderType: OrderTypeEnum,
    companyId: string,
  ) {
    const partner = await this.partnerService.findOne(partnerId, companyId);
    if (!partner) throw new NotFoundException('Partner not found');

    const valid =
      (orderType === OrderTypeEnum.SHIPMENT && partner.type === 'customer') ||
      (orderType === OrderTypeEnum.DELIVERY && partner.type === 'supplier');

    if (!valid) {
      throw new BadRequestException(
        `Invalid partner type for '${orderType}'. Shipment → customer, Delivery → supplier.`,
      );
    }
  }
}
