import { IsInt, IsOptional, IsString } from "class-validator";

export class CreateProductAttributeDto {
  @IsInt()
  product_id: number;

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
