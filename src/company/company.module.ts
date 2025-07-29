import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { CompanyResolver } from './company.resolver';
import { CompanyAuditResolver } from 'src/common/resolvers/audit-resolvers';
import { UserModule } from 'src/user/user.module';
import { ProductModule } from 'src/product/product.module';
import { WarehouseModule } from 'src/warehouse/warehouse.module';
import { PartnerModule } from 'src/partner/partner.module';
import { OrderModule } from 'src/order/order.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    UserModule,
    ProductModule,
    WarehouseModule,
    PartnerModule,
    OrderModule,
  ],
  providers: [CompanyService, CompanyResolver, CompanyAuditResolver],
  exports: [CompanyService],
})
export class CompanyModule {}
