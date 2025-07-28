import { DataSource } from 'typeorm';
import { Company } from '../entities/company/company.entity';
import { User } from '../entities/user/user.entity';
import { Partner } from '../entities/partner/partner.entity';
import { Warehouse } from '../entities/warehouse/warehouse.entity';
import { Product } from '../entities/product/product.entity';
import { Order } from '../entities/order/order.entity';
import { OrderItem } from '../entities/orderItem/orderItem.entity';
import { Invoice } from '../entities/invoice/invoice.entity';

import * as dotenv from 'dotenv';
import { envSchema } from 'src/config/config.static';

dotenv.config();
const env = envSchema.parse(process.env);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASS,
  database: env.DB_NAME,
  entities: [
    Company,
    User,
    Partner,
    Warehouse,
    Product,
    Order,
    OrderItem,
    Invoice,
  ],
  migrations: ['src/database/migrations/**/*.ts'],
  migrationsRun: true,
  synchronize: false,
  logging: true,
});
