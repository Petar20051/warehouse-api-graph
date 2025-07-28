import { MigrationInterface, QueryRunner } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as ids from '../seeds/seed-constants';
import * as bcrypt from 'bcrypt';

const escape = (s: string) => s.replace(/'/g, "''");

export class SeedInitialData1753103540800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hashed = await bcrypt.hash('password', 10);

    await queryRunner.query(`
      INSERT INTO "company" ("id", "name", "email") VALUES
        ('${ids.COMPANY_ID_1}', '${escape(faker.company.name())}', '${escape(faker.internet.email())}'),
        ('${ids.COMPANY_ID_2}', '${escape(faker.company.name())}', '${escape(faker.internet.email())}');
    `);

    await queryRunner.query(`
      INSERT INTO "user" ("id", "company_id", "full_name", "email", "password", "role") VALUES
        ('${ids.USER_ID_1}', '${ids.COMPANY_ID_1}', '${escape(faker.person.fullName())}', '${escape(faker.internet.email())}','${hashed}' , 'owner'),
        ('${ids.USER_ID_2}', '${ids.COMPANY_ID_1}', '${escape(faker.person.fullName())}', '${escape(faker.internet.email())}','${hashed}', 'operator'),
        ('${ids.USER_ID_3}', '${ids.COMPANY_ID_1}', '${escape(faker.person.fullName())}', '${escape(faker.internet.email())}','${hashed}', 'viewer'),
        ('${ids.USER_ID_4}', '${ids.COMPANY_ID_2}', '${escape(faker.person.fullName())}', '${escape(faker.internet.email())}','${hashed}', 'owner'),
        ('${ids.USER_ID_5}', '${ids.COMPANY_ID_2}', '${escape(faker.person.fullName())}', '${escape(faker.internet.email())}','${hashed}', 'operator'),
        ('${ids.USER_ID_6}', '${ids.COMPANY_ID_2}', '${escape(faker.person.fullName())}', '${escape(faker.internet.email())}','${hashed}', 'viewer');
    `);

    await queryRunner.query(`
        INSERT INTO "warehouse" ("id", "company_id", "name", "location", "supported_type", "modified_by_user_id") VALUES
          ('${ids.WAREHOUSE_ID_1}', '${ids.COMPANY_ID_1}', '${escape(faker.company.name())} Central', '${escape(faker.location.city())}', 'solid', '${ids.USER_ID_1}'),
          ('${ids.WAREHOUSE_ID_2}', '${ids.COMPANY_ID_1}', '${escape(faker.company.name())} Depot', '${escape(faker.location.city())}', 'liquid', '${ids.USER_ID_2}'),
          ('${ids.WAREHOUSE_ID_3}', '${ids.COMPANY_ID_2}', '${escape(faker.company.name())} Store', '${escape(faker.location.city())}', 'solid', '${ids.USER_ID_4}'),
          ('${ids.WAREHOUSE_ID_4}', '${ids.COMPANY_ID_2}', '${escape(faker.company.name())} Point', '${escape(faker.location.city())}', 'liquid', '${ids.USER_ID_5}');
      `);

    await queryRunner.query(`
        INSERT INTO "partner" ("id", "company_id", "name", "type", "email", "phone", "address", "modified_by_user_id") VALUES
          ('${ids.PARTNER_ID_1}', '${ids.COMPANY_ID_1}', '${escape(faker.company.name())}', 'customer', '${escape(faker.internet.email())}', '${escape(faker.phone.number())}', '${escape(faker.location.streetAddress())}', '${ids.USER_ID_1}'),
          ('${ids.PARTNER_ID_2}', '${ids.COMPANY_ID_1}', '${escape(faker.company.name())}', 'supplier', '${escape(faker.internet.email())}', '${escape(faker.phone.number())}', '${escape(faker.location.streetAddress())}', '${ids.USER_ID_2}'),
          ('${ids.PARTNER_ID_3}', '${ids.COMPANY_ID_2}', '${escape(faker.company.name())}', 'customer', '${escape(faker.internet.email())}', '${escape(faker.phone.number())}', '${escape(faker.location.streetAddress())}', '${ids.USER_ID_4}'),
          ('${ids.PARTNER_ID_4}', '${ids.COMPANY_ID_2}', '${escape(faker.company.name())}', 'supplier', '${escape(faker.internet.email())}', '${escape(faker.phone.number())}', '${escape(faker.location.streetAddress())}', '${ids.USER_ID_5}');
      `);

    await queryRunner.query(`
        INSERT INTO "product"
          ("id", "company_id", "name", "sku", "product_type", "description", "base_price", "modified_by_user_id")
          VALUES
          ('${ids.PRODUCT_ID_1}', '${ids.COMPANY_ID_1}', '${escape(faker.commerce.productName())}', '${escape(faker.string.alphanumeric({ length: 8 }))}', 'solid', '${escape(faker.commerce.productDescription())}', ${faker.commerce.price({ min: 10, max: 100 })}, '${ids.USER_ID_1}'),
          ('${ids.PRODUCT_ID_2}', '${ids.COMPANY_ID_1}', '${escape(faker.commerce.productName())}', '${escape(faker.string.alphanumeric({ length: 8 }))}', 'liquid', '${escape(faker.commerce.productDescription())}', ${faker.commerce.price({ min: 10, max: 100 })}, '${ids.USER_ID_2}'),
          ('${ids.PRODUCT_ID_3}', '${ids.COMPANY_ID_2}', '${escape(faker.commerce.productName())}', '${escape(faker.string.alphanumeric({ length: 8 }))}', 'solid', '${escape(faker.commerce.productDescription())}', ${faker.commerce.price({ min: 10, max: 100 })}, '${ids.USER_ID_4}'),
          ('${ids.PRODUCT_ID_4}', '${ids.COMPANY_ID_2}', '${escape(faker.commerce.productName())}', '${escape(faker.string.alphanumeric({ length: 8 }))}', 'liquid', '${escape(faker.commerce.productDescription())}', ${faker.commerce.price({ min: 10, max: 100 })}, '${ids.USER_ID_5}');
      `);

    await queryRunner.query(`
        INSERT INTO "order" ("id", "company_id", "warehouse_id", "partner_id", "order_type", "notes", "date", "modified_by_user_id") VALUES
          ('${ids.ORDER_ID_1}', '${ids.COMPANY_ID_1}', '${ids.WAREHOUSE_ID_1}', '${ids.PARTNER_ID_1}', 'shipment', '${escape(faker.lorem.sentence())}', '${faker.date.recent({ days: 7 }).toISOString()}', '${ids.USER_ID_1}'),
          ('${ids.ORDER_ID_2}', '${ids.COMPANY_ID_1}', '${ids.WAREHOUSE_ID_2}', '${ids.PARTNER_ID_2}', 'delivery', '${escape(faker.lorem.sentence())}', '${faker.date.recent({ days: 7 }).toISOString()}', '${ids.USER_ID_2}'),
          ('${ids.ORDER_ID_3}', '${ids.COMPANY_ID_2}', '${ids.WAREHOUSE_ID_3}', '${ids.PARTNER_ID_3}', 'shipment', '${escape(faker.lorem.sentence())}', '${faker.date.recent({ days: 7 }).toISOString()}', '${ids.USER_ID_4}'),
          ('${ids.ORDER_ID_4}', '${ids.COMPANY_ID_2}', '${ids.WAREHOUSE_ID_4}', '${ids.PARTNER_ID_4}', 'delivery', '${escape(faker.lorem.sentence())}', '${faker.date.recent({ days: 7 }).toISOString()}', '${ids.USER_ID_5}');
      `);

    await queryRunner.query(`
        INSERT INTO "order_item" ("id", "order_id", "product_id", "quantity", "unit_price", "modified_by_user_id") VALUES
          ('${ids.ORDER_ITEM_ID_1}', '${ids.ORDER_ID_1}', '${ids.PRODUCT_ID_1}', 5, 19.99, '${ids.USER_ID_1}'),
          ('${ids.ORDER_ITEM_ID_2}', '${ids.ORDER_ID_2}', '${ids.PRODUCT_ID_2}', 2, 29.99, '${ids.USER_ID_2}'),
          ('${ids.ORDER_ITEM_ID_3}', '${ids.ORDER_ID_3}', '${ids.PRODUCT_ID_3}', 3, 15.00, '${ids.USER_ID_4}'),
          ('${ids.ORDER_ITEM_ID_4}', '${ids.ORDER_ID_4}', '${ids.PRODUCT_ID_4}', 7, 42.50, '${ids.USER_ID_5}');
      `);

    await queryRunner.query(`
        INSERT INTO "invoice" ("id", "order_id", "invoice_number", "status", "date", "modified_by_user_id") VALUES
          ('${ids.INVOICE_ID_1}', '${ids.ORDER_ID_1}', 1001, 'paid', '${faker.date.recent({ days: 5 }).toISOString()}', '${ids.USER_ID_1}'),
          ('${ids.INVOICE_ID_2}', '${ids.ORDER_ID_2}', 1002, 'unpaid', '${faker.date.recent({ days: 5 }).toISOString()}', '${ids.USER_ID_2}'),
          ('${ids.INVOICE_ID_3}', '${ids.ORDER_ID_3}', 1003, 'overdue', '${faker.date.recent({ days: 5 }).toISOString()}', '${ids.USER_ID_4}'),
          ('${ids.INVOICE_ID_4}', '${ids.ORDER_ID_4}', 1004, 'paid', '${faker.date.recent({ days: 5 }).toISOString()}', '${ids.USER_ID_5}');
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "invoice" WHERE "id" IN ('${ids.INVOICE_ID_1}', '${ids.INVOICE_ID_2}', '${ids.INVOICE_ID_3}', '${ids.INVOICE_ID_4}');
      DELETE FROM "order_item" WHERE "id" IN ('${ids.ORDER_ITEM_ID_1}', '${ids.ORDER_ITEM_ID_2}', '${ids.ORDER_ITEM_ID_3}', '${ids.ORDER_ITEM_ID_4}');
      DELETE FROM "order" WHERE "id" IN ('${ids.ORDER_ID_1}', '${ids.ORDER_ID_2}', '${ids.ORDER_ID_3}', '${ids.ORDER_ID_4}');
      DELETE FROM "product" WHERE "id" IN ('${ids.PRODUCT_ID_1}', '${ids.PRODUCT_ID_2}', '${ids.PRODUCT_ID_3}', '${ids.PRODUCT_ID_4}');
      DELETE FROM "partner" WHERE "id" IN ('${ids.PARTNER_ID_1}', '${ids.PARTNER_ID_2}', '${ids.PARTNER_ID_3}', '${ids.PARTNER_ID_4}');
      DELETE FROM "warehouse" WHERE "id" IN ('${ids.WAREHOUSE_ID_1}', '${ids.WAREHOUSE_ID_2}', '${ids.WAREHOUSE_ID_3}', '${ids.WAREHOUSE_ID_4}');
      DELETE FROM "user" WHERE "id" IN ('${ids.USER_ID_1}', '${ids.USER_ID_2}', '${ids.USER_ID_3}', '${ids.USER_ID_4}', '${ids.USER_ID_5}', '${ids.USER_ID_6}');
      DELETE FROM "company" WHERE "id" IN ('${ids.COMPANY_ID_1}', '${ids.COMPANY_ID_2}');
    `);
  }
}
