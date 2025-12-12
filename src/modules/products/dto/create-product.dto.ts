import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsArray,
} from "class-validator";

export class ProductAttributeInput {
  @IsInt()
  attribute_id: number;

  @IsOptional()
  value_text?: string;

  @IsOptional()
  value_json?: any;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @IsInt()
  brand_id: number;

  @IsInt()
  generic_id: number;

  @IsOptional()
  qty?: number;

  @IsOptional()
  rate?: number;

  @IsOptional()
  sku?: string;

  @IsOptional()
  extra?: any;

  @IsOptional()
  @IsArray()
  attributes?: ProductAttributeInput[];
}
