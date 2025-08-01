import { Entity, Column } from 'typeorm';
import { BaseEntity } from 'src/common/entities/base.entity';
import { ProductTypeEnum } from './product.static';

@Entity('product')
export class Product extends BaseEntity {
  @Column({ name: 'company_id', type: 'uuid' })
  companyId!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 50, unique: true })
  sku!: string;

  @Column({
    name: 'product_type',
    type: 'enum',
    enum: ProductTypeEnum,
  })
  productType!: ProductTypeEnum;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'base_price', type: 'decimal', precision: 12, scale: 2 })
  basePrice!: number;
}
