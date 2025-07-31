import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserRole } from 'src/user/user.types';
import { AuthUser } from 'src/common/types/auth-user';

import { UserService } from 'src/user/user.service';
import { CompanyService } from 'src/company/company.service';

import {
  AuthMessages,
  ChangePasswordDto,
  ChangeUserRoleDto,
  LoginDto,
  RegisterDto,
  RegisterUserToCompanyDto,
  AuthPayloadType,
  MessagePayload,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly companyService: CompanyService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthPayloadType> {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await this.hashPassword(dto.password);

    const company = await this.companyService.create({
      name: dto.companyName,
      email: dto.companyEmail,
    });

    const user = await this.userService.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      role: UserRole.OWNER,
      companyId: company.id,
    });

    await this.companyService.update(company.id, {
      modifiedByUserId: user.id,
    });

    return this.generateToken(user);
  }

  async login(dto: LoginDto): Promise<AuthPayloadType> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !(await this.verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException(AuthMessages.invalidCredentials);
    }

    return this.generateToken(user);
  }

  async registerUserToCompany(
    dto: RegisterUserToCompanyDto,
  ): Promise<MessagePayload> {
    const existingCompany = await this.companyService.findOneById(
      dto.companyId,
    );
    if (!existingCompany) throw new NotFoundException('Company not found');

    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await this.hashPassword(dto.password);

    await this.userService.create({
      companyId: dto.companyId,
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.VIEWER,
    });

    return { message: 'User registered successfully' };
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<MessagePayload> {
    const user = await this.userService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await this.verifyPassword(dto.oldPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const newPassword = await this.hashPassword(dto.newPassword);
    await this.userService.update(userId, { password: newPassword });

    return { message: 'Password changed successfully' };
  }

  async changeUserRole(
    dto: ChangeUserRoleDto,
    currentUser: AuthUser,
  ): Promise<MessagePayload> {
    const user = await this.userService.findOneByIdAndCompany(
      dto.userId,
      currentUser.companyId,
    );
    if (!user) throw new NotFoundException('User not found');

    await this.userService.update(user.id, { role: dto.role });

    return { message: 'User role updated successfully' };
  }

  private generateToken(user: {
    id: string;
    role: string;
    companyId: string;
  }): AuthPayloadType {
    return {
      accessToken: this.jwtService.sign({
        sub: user.id,
        role: user.role,
        companyId: user.companyId,
      }),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private async verifyPassword(
    plain: string,
    hashed: string,
  ): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
