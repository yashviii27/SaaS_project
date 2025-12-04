import { IsString, IsNotEmpty, IsInt, IsOptional } from "class-validator";

export class CreateGenericDto {
  @IsString()
  @IsNotEmpty()
  generic_name: string;

  @IsInt()
  group_id: number;

  @IsInt()
  category_id: number;

  @IsOptional()
  @IsString()
  description?: string;
}
