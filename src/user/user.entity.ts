import { Column, Entity } from 'typeorm';
import { UserRole } from './user.types';
import { BaseEntity } from 'src/common/entities/base.entity';

@Entity('user')
export class User extends BaseEntity {
  @Column({ type: 'uuid' })
  companyId!: string;

  @Column({ type: 'varchar', length: 100 })
  fullName!: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role!: UserRole;
}
