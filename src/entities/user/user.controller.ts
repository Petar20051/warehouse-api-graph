import {
  Controller,
  Get,
  //Post,
  Delete,
  Body,
  Param,
  Put,
} from '@nestjs/common';
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
  //createUserSchema,
  UpdateUserDto,
  updateUserSchema,
  UserRole,
} from './user.static';
import { ZodValidationPipe } from 'nestjs-zod';
import { IdParamDto, idParamSchema } from 'src/common/types/id-param.static';
import { User as UserDecorator } from 'src/auth/decorators/user.decorator';
import { AuthUser } from 'src/common/types/auth-user';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CustomMessage } from 'src/common/decorators/custom-message.decorator';
import { BaseController } from 'src/common/controller/base.controller';
import { DeepPartial } from 'typeorm';

@ApiTags('Users')
@ApiBearerAuth('Authorization')
@Controller('users')
export class UserController extends BaseController<
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
  findAll(@UserDecorator() user: AuthUser) {
    return super.findAll(user);
  }

  @CustomMessage('User retrieved successfully')
  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  findOne(
    @Param(new ZodValidationPipe(idParamSchema)) params: IdParamDto,
    @UserDecorator() user: AuthUser,
  ) {
    return super.findOne(params, user);
  }

  /*@CustomMessage('User created successfully')
  @Post()
  @Roles(UserRole.OWNER, UserRole.OPERATOR)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Fields required to create a user',
    examples: {
      minimal: { value: { fullName: '', email: '', password: '', role: '' } },
    },
  })
  create(
    @Body(new ZodValidationPipe(createUserSchema)) dto: CreateUserDto,
    @UserDecorator() user: AuthUser,
  ) {
    return super.create(dto, user);
  }*/

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
    @UserDecorator() user: AuthUser,
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
    @UserDecorator() user: AuthUser,
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
    @UserDecorator() user: AuthUser,
  ) {
    return super.hardDelete(params, user);
  }
}
