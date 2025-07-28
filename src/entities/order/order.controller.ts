import {
  Controller,
  Body,
  Param,
  Delete,
  Post,
  Get,
  Put,
} from '@nestjs/common';
import { Order } from './order.entity';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  createOrderSchema,
  CreateOrderWithItemsDto,
  createOrderWithItemsSchema,
  UpdateOrderDto,
  updateOrderSchema,
} from './order.static';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { User } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/common/types/auth-user';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from '../user/user.static';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { BaseController } from 'src/common/controller/base.controller';

@ApiTags('Orders')
@ApiBearerAuth('Authorization')
@Controller('orders')
export class OrderController extends BaseController<Order> {
  constructor(private readonly orderService: OrderService) {
    super(orderService);
  }

  @CustomMessage('Orders retrieved successfully')
  @Get()
  @ApiOperation({ summary: "Get all orders for the current user's company" })
  findAll(@User() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('Order retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  @CustomMessage('Order created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new order' })
  @ApiBody({
    type: CreateOrderDto,
    description: 'Fields required to create an order',
    examples: {
      minimal: {
        value: {
          warehouseId: '',
          partnerID: '',
          orderType: '',
          notes: '',
          date: '',
        },
      },
    },
  })
  override create(
    @Body(new ZodValidationPipe(createOrderSchema)) dto: CreateOrderDto,
    @User() user: AuthUser,
  ) {
    return super.create(dto, user);
  }

  @CustomMessage('Order updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  @ApiBody({
    type: UpdateOrderDto,
    description: 'Fields to update an order',
    examples: {
      empty: { value: { warehouseId: '', orderType: '', notes: '', date: '' } },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateOrderSchema)) dto: UpdateOrderDto,
    @User() user: AuthUser,
  ) {
    return super.update(params, dto, user);
  }

  @CustomMessage('Order soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete an order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('Order permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Permanently delete an order by ID' })
  @ApiParam({ name: 'id', description: 'Order UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }

  @Post('full')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @CustomMessage('Order with items created successfully')
  @ApiOperation({ summary: 'Create order with nested order items' })
  @ApiBody({
    type: CreateOrderWithItemsDto,
    description: 'Full order creation with its items',
  })
  createFullOrder(
    @Body(new ZodValidationPipe(createOrderWithItemsSchema))
    dto: CreateOrderWithItemsDto,
    @User() user: AuthUser,
  ) {
    return this.orderService.createFullOrder(dto, user);
  }
}
