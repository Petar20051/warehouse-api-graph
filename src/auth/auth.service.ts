import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/user/user.entity';
import { Company } from 'src/company/company.entity';
import { UserRole } from 'src/user/user.types';
import { AuthUser } from 'src/common/types/auth-user';

import {
  AuthMessages,
  ChangePasswordDto,
  ChangeUserRoleDto,
  LoginDto,
  RegisterDto,
  RegisterUserToCompanyDto,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashedPassword = await this.hashPassword(dto.password);

    const company = this.companyRepo.create({
      name: dto.companyName,
      email: dto.companyEmail,
    });
    await this.companyRepo.save(company);

    const user = this.userRepo.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      role: UserRole.OWNER,
      companyId: company.id,
    });
    await this.userRepo.save(user);

    company.modifiedByUserId = user.id;
    await this.companyRepo.save(company);

    return this.generateToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !(await this.verifyPassword(dto.password, user.password))) {
      throw new UnauthorizedException(AuthMessages.invalidCredentials);
    }

    return this.generateToken(user);
  }

  async registerUserToCompany(dto: RegisterUserToCompanyDto) {
    const existingCompany = await this.companyRepo.findOne({
      where: { id: dto.companyId },
    });
    if (!existingCompany) throw new NotFoundException('Company not found');

    const existingUser = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await this.hashPassword(dto.password);

    const newUser = this.userRepo.create({
      companyId: dto.companyId,
      fullName: dto.fullName,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.VIEWER,
    });

    await this.userRepo.save(newUser);
    return { message: 'User registered successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (!(await this.verifyPassword(dto.oldPassword, user.password))) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    user.password = await this.hashPassword(dto.newPassword);
    await this.userRepo.save(user);

    return { message: 'Password changed successfully' };
  }

  async changeUserRole(dto: ChangeUserRoleDto, currentUser: AuthUser) {
    const user = await this.userRepo.findOne({
      where: { id: dto.userId, companyId: currentUser.companyId },
    });

    if (!user) throw new NotFoundException('User not found');

    user.role = dto.role;
    await this.userRepo.save(user);

    return { message: 'User role updated successfully' };
  }

  private generateToken(user: User) {
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
