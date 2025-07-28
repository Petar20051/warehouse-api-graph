import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { BaseService } from '../../common/services/base.service';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(@InjectRepository(User) repo: Repository<User>) {
    super(repo);
  }

  async findAllSafeByCompany(companyId: string): Promise<User[]> {
    const users = await super.findAllByCompany(companyId);
    const safeUsers = users.map((u) => {
      u.password = '*****';
      return u;
    });
    return safeUsers;
  }

  async findSafeOne(id: string, companyId: string): Promise<User | null> {
    const user = await super.findOne(id, companyId);
    if (!user) return null;
    user.password = '*********';
    return user;
  }
}
