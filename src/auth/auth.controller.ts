import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from 'src/entities/user/user.static';
import { LoginDto, RegisterDto, RegisterUserToCompanyDto } from './auth.static';
import { ZodValidationPipe } from 'nestjs-zod';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new company and owner user' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      example: {
        summary: 'Basic registration',
        value: {
          companyName: '',
          companyEmail: '',
          fullName: ' ',
          email: '',
          password: '',
        },
      },
    },
  })
  async register(@Body(new ZodValidationPipe(RegisterDto)) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({
    type: LoginDto,
    examples: {
      example: {
        summary: 'Basic login',
        value: {
          email: '',
          password: '',
        },
      },
    },
  })
  async login(@Body(new ZodValidationPipe(LoginDto)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('register-user')
  @ApiOperation({
    summary: 'Register a user to an existing company (default: viewer)',
  })
  @ApiBody({
    type: RegisterUserToCompanyDto,
    examples: {
      example: {
        summary: 'Register viewer user',
        value: {
          companyId: '',
          fullName: '',
          email: '',
          password: '',
        },
      },
    },
  })
  async registerUser(
    @Body(new ZodValidationPipe(RegisterUserToCompanyDto))
    dto: RegisterUserToCompanyDto,
  ) {
    return this.authService.registerUserToCompany(dto);
  }
}
