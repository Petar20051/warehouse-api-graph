import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreatePartnerTable1753103094010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TYPE "partner_type" AS ENUM ('customer', 'supplier')
      `);

    await queryRunner.createTable(
      new Table({
        name: 'partner',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'partner_type',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '150',
            isNullable: true,
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'address',
            type: 'text',
            isNullable: true,
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
        uniques: [
          new TableUnique({
            name: 'unique_partner_name_company',
            columnNames: ['name', 'company_id'],
          }),
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'partner',
      new TableForeignKey({
        columnNames: ['company_id'],
        referencedTableName: 'company',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'partner',
      new TableForeignKey({
        columnNames: ['modified_by_user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('partner');
    await queryRunner.query(`DROP TYPE IF EXISTS "partner_type"`);
  }
}
