import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddCompanyModifiedByUserFk1753102806757
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'company',
      new TableForeignKey({
        name: 'fk_company_modified_by',
        columnNames: ['modified_by_user_id'],
        referencedTableName: 'user',
        referencedColumnNames: ['id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('company', 'fk_company_modified_by');
  }
}
