import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/common/services/base.service';

@Injectable()
export class CompanyService extends BaseService<Company> {
  constructor(@InjectRepository(Company) repo: Repository<Company>) {
    super(repo);
  }
}
