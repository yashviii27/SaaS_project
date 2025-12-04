import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { Request } from "express";
import { AttributeValuesService } from "./attribute-values.service";
import { CreateAttributeValueDto } from "./dto/create-attribute-value.dto";
import { UpdateAttributeValueDto } from "./dto/update-attribute-value.dto";

@Controller("attribute-values")
export class AttributeValuesController {
  constructor(private readonly service: AttributeValuesService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateAttributeValueDto) {
    if ((req as any).role !== "admin")
      throw new ForbiddenException("Admin only");
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query("attribute_id") attribute_id: number,
    @Query("page") page: number,
    @Query("limit") limit: number
  ) {
    return this.service.findAll({
      attribute_id: attribute_id ? Number(attribute_id) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 100,
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateAttributeValueDto
  ) {
    if ((req as any).role !== "admin")
      throw new ForbiddenException("Admin only");
    return this.service.update(Number(id), dto);
  }

  @Delete(":id")
  async remove(@Req() req: Request, @Param("id") id: string) {
    if ((req as any).role !== "admin")
      throw new ForbiddenException("Admin only");
    return this.service.remove(Number(id));
  }
}
