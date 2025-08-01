import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { WarehouseType, WarehouseTopStockType } from './warehouse.types';
import { Warehouse } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/user.static';

import { OrderService } from 'src/order/order.service';
import { OrderType } from 'src/order/order.types';
import { Order } from 'src/order/order.entity';
import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';
import { CreateWarehouseInput, UpdateWarehouseInput } from './warehouse.inputs';
import {
  createWarehouseSchema,
  updateWarehouseSchema,
} from './warehouse.static';

@Resolver(() => WarehouseType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseResolver extends BaseResolver<
  Warehouse,
  CreateWarehouseInput,
  UpdateWarehouseInput
> {
  constructor(
    private readonly warehouseService: WarehouseService,
    private readonly orderService: OrderService,
  ) {
    super(warehouseService);
  }

  @Query(() => [WarehouseType], { name: 'getAllWarehouses' })
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => WarehouseType, { nullable: true, name: 'getWarehouseById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Query(() => [WarehouseTopStockType], {
    name: 'getProductWithHighestStock',
    nullable: true,
    description:
      'Returns products with the highest stock across all warehouses for a company. Stock = deliveries - shipments.',
  })
  async getProductWithHighestStock(
    @CurrentUser('companyId') companyId: string,
  ): Promise<WarehouseTopStockType[] | null> {
    return this.warehouseService.getProductWithHighestStock(companyId);
  }

  @Query(() => [WarehouseTopStockType], {
    name: 'getWarehouseStockBreakdown',
    nullable: true,
    description:
      'Returns product stock breakdown for a given warehouse. Ensures the warehouse belongs to the company.',
  })
  async getWarehouseStockBreakdown(
    @Args('warehouseId', { type: () => String }) warehouseId: string,
    @CurrentUser('companyId') companyId: string,
  ): Promise<WarehouseTopStockType[] | null> {
    return this.warehouseService.getWarehouseStockBreakdown(
      warehouseId,
      companyId,
    );
  }

  @Mutation(() => WarehouseType, { name: 'createWarehouse' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override create(
    @Args('input', new ZodValidationPipe(createWarehouseSchema))
    input: CreateWarehouseInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => WarehouseType, { name: 'updateWarehouse' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updateWarehouseSchema))
    input: UpdateWarehouseInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeleteWarehouse' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeleteWarehouse' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @ResolveField(() => [OrderType], { nullable: 'itemsAndList' })
  orders(@Parent() warehouse: Warehouse): Promise<Order[]> {
    return this.orderService.findByWarehouse(warehouse.id, warehouse.companyId);
  }
}
