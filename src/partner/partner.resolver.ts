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
  PartnerType,
  CreatePartnerInput,
  UpdatePartnerInput,
  createPartnerSchema,
  updatePartnerSchema,
} from './partner.types';
import { Partner } from './partner.entity';
import { PartnerService } from './partner.service';

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

@Resolver(() => PartnerType)
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnerResolver extends BaseResolver<
  Partner,
  CreatePartnerInput,
  UpdatePartnerInput
> {
  constructor(
    private readonly partnerService: PartnerService,
    private readonly orderService: OrderService,
  ) {
    super(partnerService);
  }
  @Query(() => [PartnerType], { name: 'getAllPartners' })
  override findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @Query(() => PartnerType, { nullable: true, name: 'getPartnerById' })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(id, user);
  }
  @Mutation(() => PartnerType, { name: 'createPartner' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override create(
    @Args('input', new ZodValidationPipe(createPartnerSchema))
    input: CreatePartnerInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.create(input, user);
  }

  @Mutation(() => PartnerType, { name: 'updatePartner' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override update(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @Args('input', new ZodValidationPipe(updatePartnerSchema))
    input: UpdatePartnerInput,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(id, input, user);
  }

  @Mutation(() => Boolean, { name: 'softDeletePartner' })
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  override softDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(id, user);
  }

  @Mutation(() => Boolean, { name: 'hardDeletePartner' })
  @Roles(UserRole.OWNER)
  override hardDelete(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(id, user);
  }

  @ResolveField(() => [OrderType], { nullable: 'itemsAndList' })
  orders(
    @Parent() partner: Partner,
    @CurrentUser() user: AuthUser,
  ): Promise<Order[]> {
    return this.orderService.findByPartner(partner.id, user.companyId);
  }
}
