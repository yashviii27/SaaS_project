import { IsInt, IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateAttributeValueDto {
  @IsInt()
  attribute_id: number;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsOptional()
  @IsString()
  value_key?: string;
}
