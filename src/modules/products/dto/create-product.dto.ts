import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  IsArray,
} from "class-validator";

export class ProductAttributeInput {
  @IsString()
  name: string;     // <── attribute_name instead of attribute_id

  @IsOptional()
  value: any;       // <── can be string, number, boolean, object
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  product_name: string;

  @IsString()
  brand: string;     // <── name, not ID

  @IsString()
  generic: string;   // <── name, not ID

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
