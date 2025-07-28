import {
  Controller,
  Body,
  Param,
  Delete,
  Post,
  Get,
  Put,
} from '@nestjs/common';
import { OrderItem } from './orderItem.entity';
import { OrderItemService } from './orderItem.service';
import {
  CreateOrderItemDto,
  createOrderItemSchema,
  UpdateOrderItemDto,
  updateOrderItemSchema,
} from './orderItem.static';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { AuthUser } from 'src/common/types/auth-user';
import { User } from 'src/auth/decorators/user.decorator';
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

@ApiTags('OrderItems')
@ApiBearerAuth('Authorization')
@Controller('order-items')
export class OrderItemController extends BaseController<OrderItem> {
  constructor(private readonly orderItemService: OrderItemService) {
    super(orderItemService);
  }

  @CustomMessage('Order items retrieved successfully')
  @Get()
  @ApiOperation({
    summary: "Get all order items for the current user's company",
  })
  findAll(@User() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('Order item retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single order item by ID' })
  @ApiParam({ name: 'id', description: 'OrderItem UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  @CustomMessage('Order item created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new order item' })
  @ApiBody({
    type: CreateOrderItemDto,
    description: 'Fields required to create an order item',
    examples: {
      minimal: {
        value: { orderId: '', productId: '', quantity: 0, unitPrice: 0 },
      },
    },
  })
  create(
    @Body(new ZodValidationPipe(createOrderItemSchema)) dto: CreateOrderItemDto,
    @User() user: AuthUser,
  ) {
    return super.create(dto, user);
  }

  @CustomMessage('Order item updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update an order item by ID' })
  @ApiParam({ name: 'id', description: 'OrderItem UUID' })
  @ApiBody({
    type: UpdateOrderItemDto,
    description: 'Fields to update an order item',
    examples: {
      empty: {
        value: { orderId: '', productId: '', quantity: 0, unitPrice: 0 },
      },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateOrderItemSchema)) dto: UpdateOrderItemDto,
    @User() user: AuthUser,
  ) {
    return super.update(params, dto, user);
  }

  @CustomMessage('Order item soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete an order item by ID' })
  @ApiParam({ name: 'id', description: 'OrderItem UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('Order item permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Permanently delete an order item by ID' })
  @ApiParam({ name: 'id', description: 'OrderItem UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @User() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
