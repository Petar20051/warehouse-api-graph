import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { ProductAuditResolver } from 'src/common/resolvers/audit-resolvers';
import { OrderItemModule } from 'src/orderItem/orderItem.module';
import { UserModule } from 'src/user/user.module';
import { OrderItem } from 'src/orderItem/orderItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, OrderItem]),
    OrderItemModule,
    UserModule,
  ],
  providers: [ProductService, ProductResolver, ProductAuditResolver],
  exports: [ProductService],
})
export class ProductModule {}
