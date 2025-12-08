import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsIn,
  IsBoolean,
} from "class-validator";

export const ALLOWED_INPUT_TYPES = [
  "text",
  "dropdown",
  "number",
  "range",
  "date",
  "month",
  "year",
  "boolean",
];

export class CreateAttributeDto {
  @IsInt()
  generic_id: number;

  @IsString()
  @IsNotEmpty()
  attribute_name: string;

  @IsString()
  @IsIn(ALLOWED_INPUT_TYPES)
  input_type: string;

  @IsOptional()
  @IsBoolean()
  is_required?: boolean;

  @IsOptional()
  @IsString()
  data_type?: string;

  @IsOptional()
  extra?: any; // freeform json
}
