import { Field, Float, InputType } from '@nestjs/graphql';
import { ProductTypeEnum } from './product.static';

@InputType()
export class CreateProductInput {
  @Field()
  name!: string;

  @Field()
  sku!: string;

  @Field(() => ProductTypeEnum)
  productType!: ProductTypeEnum;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  basePrice!: number;
}

@InputType()
export class UpdateProductInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => ProductTypeEnum, { nullable: true })
  productType?: ProductTypeEnum;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  basePrice?: number;
}
