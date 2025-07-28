import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user/user.entity';
import { Company } from 'src/entities/company/company.entity';
import { UserRole } from 'src/entities/user/user.static';
import {
  AuthMessages,
  LoginDto,
  RegisterDto,
  RegisterUserToCompanyDto,
} from './auth.static';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: RegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(data.password, 10);

    const company = this.companyRepo.create({
      name: data.companyName,
      email: data.companyEmail,
    });
    await this.companyRepo.save(company);

    const user = this.userRepo.create({
      email: data.email,
      password: hashed,
      fullName: data.fullName,
      role: UserRole.OWNER,
      companyId: company.id,
    });
    await this.userRepo.save(user);

    company.modifiedByUserId = user.id;
    await this.companyRepo.save(company);

    return this.generateToken(user);
  }

  async login(data: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: data.email } });
    if (!user) throw new UnauthorizedException(AuthMessages.invalidCredentials);

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch)
      throw new UnauthorizedException(AuthMessages.invalidCredentials);

    return this.generateToken(user);
  }

  async registerUserToCompany(data: RegisterUserToCompanyDto) {
    const { companyId, fullName, email, password } = data;

    const existingCompany = await this.companyRepo.findOne({
      where: { id: companyId },
    });
    if (!existingCompany) throw new NotFoundException('Company not found');

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      companyId,
      fullName,
      email,
      password: hashedPassword,
      role: UserRole.VIEWER,
    });

    await this.userRepo.save(newUser);
    return { message: 'User registered successfully' };
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
