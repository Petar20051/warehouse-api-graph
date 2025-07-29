import { DataSource } from 'typeorm';

import * as dotenv from 'dotenv';
import { envSchema } from 'src/config/config.static';
import { Company } from 'src/company/company.entity';
import { User } from 'src/user/user.entity';
import { Partner } from 'src/partner/partner.entity';
import { Warehouse } from 'src/warehouse/warehouse.entity';
import { Product } from 'src/product/product.entity';
import { Order } from 'src/order/order.entity';
import { OrderItem } from 'src/orderItem/orderItem.entity';
import { Invoice } from 'src/invoice/invoice.entity';

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
