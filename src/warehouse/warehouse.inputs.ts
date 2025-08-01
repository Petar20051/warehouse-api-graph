import { Field, InputType } from '@nestjs/graphql';
import { ProductTypeEnum } from 'src/product/product.static';

@InputType()
export class CreateWarehouseInput {
  @Field()
  name!: string;

  @Field()
  location!: string;

  @Field(() => ProductTypeEnum)
  supportedType!: ProductTypeEnum;
}

@InputType()
export class UpdateWarehouseInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  location?: string;

  @Field(() => ProductTypeEnum, { nullable: true })
  supportedType?: ProductTypeEnum;
}
