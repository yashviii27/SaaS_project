import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateBrandDto {
  @IsString()
  @IsNotEmpty()
  brand_name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
