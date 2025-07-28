import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { BaseService } from 'src/common/services/base.service';
import { InvoiceService } from '../invoice/invoice.service';
import { AuthUser } from 'src/common/types/auth-user';
import { CreateOrderDto, CreateOrderWithItemsDto } from './order.static';
import { InvoiceStatus } from '../invoice/invoice.entity';
import { Partner } from '../partner/partner.entity';
import { OrderItem } from '../orderItem/orderItem.entity';

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
    return this.repo.find({
      where: {
        company: { id: companyId },
      },
      relations: ['partner', 'warehouse', 'company', 'invoice'],
    });
  }

  async createWithUserContext(
    dto: CreateOrderDto,
    user: AuthUser,
  ): Promise<Order> {
    const warehouse = await this.repo.manager.findOne('Warehouse', {
      where: { id: dto.warehouseId, company: { id: user.companyId } },
    });

    if (!warehouse) {
      throw new Error('Warehouse not found or does not belong to your company');
    }
    let partner = null;
    if (dto.partnerId) {
      partner = await this.repo.manager.findOne<Partner>('Partner', {
        where: { id: dto.partnerId, company: { id: user.companyId } },
      });

      if (!partner) {
        throw new Error('Partner not found or does not belong to your company');
      }

      const isValid =
        (dto.orderType === 'shipment' && partner.type === 'customer') ||
        (dto.orderType === 'delivery' && partner.type === 'supplier');

      if (!isValid) {
        throw new Error(
          `Invalid partner type for orderType '${dto.orderType}'. Shipment requires a customer, delivery requires a supplier.`,
        );
      }
    }

    const created = await super.createWithUserContext(
      {
        ...dto,
        warehouse,
        partner,
      },
      user,
    );

    const order = await this.repo.findOne({
      where: { id: created.id },
      relations: ['partner', 'warehouse', 'company', 'invoice'],
    });

    if (!order) throw new Error('Order not found after creation');

    const shouldCreateInvoice =
      order.partner?.id && order.orderType === 'shipment';

    if (shouldCreateInvoice) {
      await this.invoiceService.createWithUserContext(
        {
          order: { id: order.id },
          status: InvoiceStatus.UNPAID,
        },
        user,
      );
    }

    return order;
  }

  async createFullOrder(
    dto: CreateOrderWithItemsDto,
    user: AuthUser,
  ): Promise<Order> {
    return this.repo.manager.transaction(async (manager) => {
      const warehouse = await manager.findOne('Warehouse', {
        where: { id: dto.warehouseId, company: { id: user.companyId } },
      });

      if (!warehouse) {
        throw new NotFoundException('Warehouse not found or unauthorized');
      }

      let partner: Partner | null = null;
      if (dto.partnerId) {
        partner = await manager.findOne(Partner, {
          where: { id: dto.partnerId, company: { id: user.companyId } },
        });

        if (!partner) {
          throw new NotFoundException('Partner not found or unauthorized');
        }

        const isValid =
          (dto.orderType === 'shipment' && partner.type === 'customer') ||
          (dto.orderType === 'delivery' && partner.type === 'supplier');

        if (!isValid) {
          throw new BadRequestException(
            `Invalid partner type for orderType '${dto.orderType}'. Shipment requires a customer, delivery requires a supplier.`,
          );
        }
      }

      const order = manager.create(Order, {
        warehouse,
        partner,
        company: { id: user.companyId },
        notes: dto.notes,
        orderType: dto.orderType,
        date: dto.date ?? new Date(),
        createdByUserId: user.userId,
      });

      const savedOrder = await manager.save(order);

      const items = dto.orderItems.map((item) =>
        manager.create(OrderItem, {
          ...item,
          order: savedOrder,
          createdByUserId: user.userId,
        }),
      );

      await manager.save(items);

      const shouldCreateInvoice =
        Boolean(partner?.id) && dto.orderType === 'shipment';

      if (shouldCreateInvoice) {
        await this.invoiceService.createWithUserContext(
          {
            order: { id: savedOrder.id },
            status: InvoiceStatus.UNPAID,
          },
          user,
        );
      }

      const fullOrder = await manager.findOne(Order, {
        where: { id: savedOrder.id },
        relations: ['partner', 'warehouse', 'orderItems', 'invoice'],
      });

      if (!fullOrder) {
        throw new NotFoundException('Order not found after creation');
      }

      return fullOrder;
    });
  }
}
