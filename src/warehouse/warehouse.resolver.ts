import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import {
  WarehouseType,
  CreateWarehouseInput,
  UpdateWarehouseInput,
  createWarehouseSchema,
  updateWarehouseSchema,
} from './warehouse.types';
import { Warehouse } from './warehouse.entity';
import { WarehouseService } from './warehouse.service';

import { BaseResolver } from 'src/common/resolvers/base.resolver';
import { AuthUser } from 'src/common/types/auth-user';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/user/user.types';

import { OrderService } from 'src/order/order.service';
import { OrderType } from 'src/order/order.types';
import { Order } from 'src/order/order.entity';
import { ZodValidationPipe } from 'nestjs-zod';
import { idParamSchema } from 'src/common/types/id-param.static';

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
  override findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @Query(() => WarehouseType, { nullable: true, name: 'getWarehouseById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(id, user);
  }

  @Mutation(() => WarehouseType, { name: 'createWarehouse' })
  override create(
    @Args('input', new ZodValidationPipe(createWarehouseSchema))
    input: CreateWarehouseInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => WarehouseType, { name: 'updateWarehouse' })
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
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(id, user);
  }

  @ResolveField(() => [OrderType], { nullable: 'itemsAndList' })
  orders(
    @Parent() warehouse: Warehouse,
    @CurrentUser() user: AuthUser,
  ): Promise<Order[]> {
    return this.orderService.findByWarehouse(warehouse.id, user.companyId);
  }
}
