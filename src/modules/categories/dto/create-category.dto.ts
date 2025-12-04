import { IsString, IsNotEmpty, IsInt } from "class-validator";

export class CreateCategoryDto {
  @IsInt()
  group_id: number;

  @IsString()
  @IsNotEmpty()
  category_name: string;
}
