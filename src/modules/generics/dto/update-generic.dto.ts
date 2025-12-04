import { PartialType } from "@nestjs/mapped-types";
import { CreateGenericDto } from "./create-generic.dto";

export class UpdateGenericDto extends PartialType(CreateGenericDto) {}
