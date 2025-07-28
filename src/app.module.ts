import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

import { CompanyModule } from './entities/company/company.module';
import { UserModule } from './entities/user/user.module';
import { AuthModule } from './auth/auth.module';
import { WarehouseModule } from './entities/warehouse/warehouse.module';
import { ProductModule } from './entities/product/product.module';
import { PartnerModule } from './entities/partner/partner.module';
import { OrderModule } from './entities/order/order.module';
import { OrderItemModule } from './entities/orderItem/orderItem.module';
import { InvoiceModule } from './entities/invoice/invoice.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'),
        database: config.get('DB_NAME'),
        migrations: ['src/database/migrations/**/*.ts'],
        migrationsRun: true,
        autoLoadEntities: true,
        synchronize: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    AuthModule,
    CompanyModule,
    UserModule,
    WarehouseModule,
    ProductModule,
    PartnerModule,
    OrderModule,
    OrderItemModule,
    InvoiceModule,
  ],
})
export class AppModule {}
