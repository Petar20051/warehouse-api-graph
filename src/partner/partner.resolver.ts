import {
  Resolver,
  ResolveField,
  Parent,
  Query,
  Mutation,
  Args,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { PartnerType, TopCustomerResultType } from './partner.types';
import { Partner } from './partner.entity';
import { PartnerService } from './partner.service';

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
import { idParamSchema } from 'src/common/types/id-param.static';
import { CreatePartnerInput, UpdatePartnerInput } from './partner.inputs';
import { createPartnerSchema, updatePartnerSchema } from './partner.static';

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
  override findAll(@CurrentUser('companyId') companyId: string) {
    return super.findAll(companyId);
  }

  @Query(() => PartnerType, { name: 'getPartnerById', nullable: true })
  override findOne(
    @Args('id', new ZodValidationPipe(idParamSchema)) id: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.findOne(id, companyId);
  }

  @Query(() => TopCustomerResultType, {
    name: 'getTopCustomerByOrders',
    nullable: true,
  })
  async getTopCustomerByOrders(
    @CurrentUser() user: AuthUser,
  ): Promise<TopCustomerResultType | null> {
    const raw = await this.partnerService.getTopCustomerByOrders(
      user.companyId,
    );
    return raw ? { ...raw, totalOrders: Number(raw.totalOrders) } : null;
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
    @CurrentUser('companyId') companyId: string,
  ) {
    return super.hardDelete(id, companyId);
  }

  @ResolveField(() => [OrderType], { nullable: 'itemsAndList' })
  orders(@Parent() partner: Partner): Promise<Order[]> {
    return this.orderService.findByPartner(partner.id, partner.companyId);
  }
}
