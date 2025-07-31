import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
  Float,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import {
  InvoiceType,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  createInvoiceSchema,
  updateInvoiceSchema,
} from './invoice.types';
import { Invoice } from './invoice.entity';
import { InvoiceService } from './invoice.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/user.types';
import { OrderType } from 'src/order/order.types';
import { OrderService } from 'src/order/order.service';
import { Order } from 'src/order/order.entity';
import { OrderItemService } from 'src/orderItem/orderItem.service';
import { idParamSchema } from 'src/common/types/id-param.static';

@Resolver(() => InvoiceType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoiceResolver extends BaseResolver<
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput
> {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly orderService: OrderService,
    private readonly orderItemService: OrderItemService,
  ) {
    super(invoiceService);
  }

  @Query(() => [InvoiceType], { name: 'getAllInvoices' })
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => InvoiceType, { nullable: true, name: 'getInvoiceById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Mutation(() => InvoiceType, { name: 'createInvoice' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override create(
    @Args('input', new ZodValidationPipe(createInvoiceSchema))
    input: CreateInvoiceInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => InvoiceType, { name: 'updateInvoice' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateInvoiceSchema))
    input: UpdateInvoiceInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteInvoice' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteInvoice' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @ResolveField(() => OrderType)
  async order(
    @Parent() invoice: Invoice,
    @CurrentUser('companyId') companyId: string,
  ): Promise<Order | null> {
    return this.orderService.findOne(invoice.orderId, companyId);
  }

  @ResolveField(() => Float)
  async total(@Parent() invoice: Invoice): Promise<number> {
    const items = await this.orderItemService.findByOrder(invoice.orderId);
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }
}
