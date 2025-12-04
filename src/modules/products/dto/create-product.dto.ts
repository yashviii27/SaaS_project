import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsArray,
} from "class-validator";

export class ProductAttributeInput {
  @IsInt()
  attribute_id: number;

  @IsOptional()
  @IsInt()
  value_id?: number;

  @IsOptional()
  @IsString()
  value_text?: string;

  @IsOptional()
  value_json?: any;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @IsInt()
  generic_id: number;

  @IsInt()
  brand_id: number;

  @IsOptional()
  @IsInt()
  qty?: number;

  @IsOptional()
  @IsNumber()
  rate?: number;

  @IsOptional()
  sku?: string;

  @IsOptional()
  extra?: any;

  @IsOptional()
  @IsArray()
  attributes?: ProductAttributeInput[];
}
