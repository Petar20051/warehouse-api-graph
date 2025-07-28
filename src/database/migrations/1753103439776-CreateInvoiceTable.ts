import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateInvoiceTable1753103439776 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "invoice_status" AS ENUM ('unpaid', 'paid', 'overdue')
      `);

    await queryRunner.query(`
        CREATE SEQUENCE invoice_invoice_number_seq START 1000 INCREMENT 1
      `);

    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION generate_invoice_number()
        RETURNS TRIGGER AS $$
        DECLARE
          seq_id INTEGER;
        BEGIN
          SELECT nextval('invoice_invoice_number_seq') INTO seq_id;
          NEW.invoice_number := 'INV-' || seq_id;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);

    await queryRunner.createTable(
      new Table({
        name: 'invoice',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'invoice_number',
            type: 'varchar',
            length: '50',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'order_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'invoice_status',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'modified_by_user_id',
            type: 'uuid',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'invoice',
      new TableForeignKey({
        columnNames: ['order_id'],
        referencedTableName: 'order',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'invoice',
      new TableForeignKey({
        columnNames: ['modified_by_user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.query(`
        CREATE TRIGGER set_invoice_number
        BEFORE INSERT ON invoice
        FOR EACH ROW
        EXECUTE FUNCTION generate_invoice_number();
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS set_invoice_number ON invoice`,
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS generate_invoice_number`);
    await queryRunner.dropTable('invoice');
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS invoice_invoice_number_seq`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "invoice_status"`);
  }
}
