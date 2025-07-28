import { Controller, Get, Delete, Body, Param, Put } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { User } from './user.entity';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  updateUserSchema,
  UserRole,
} from './user.types';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/common/types/auth-user';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { BaseController } from 'src/common/controller/base.controller';
import { DeepPartial } from 'typeorm';

@ApiTags('Users')
@ApiBearerAuth('Authorization')
@Controller('users')
export class UserResolver extends BaseController<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @CustomMessage('Users retrieved successfully')
  @Get()
  @ApiOperation({ summary: "Get all users for the current user's company" })
  findAll(@CurrentUser() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('User retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  @CustomMessage('User updated successfully')
  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Fields to update a user',
    examples: {
      empty: { value: { fullName: '', email: '', password: '', role: '' } },
    },
  })
  update(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.update(params, dto as DeepPartial<User>, user);
  }

  @CustomMessage('User soft-deleted successfully')
  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Soft delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  softDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.softDelete(params, user);
  }

  @CustomMessage('User permanently deleted')
  @Delete(':id/hard')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Permanently delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  hardDelete(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @CurrentUser() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
