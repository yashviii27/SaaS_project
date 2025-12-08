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
import { AttributesService } from "./attributes.service";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";

@Controller("attributes")
export class AttributesController {
  constructor(private readonly service: AttributesService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Body() dto: CreateAttributeDto | CreateAttributeDto[]
  ) {
    if ((req as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }

    // If array → createMany
    if (Array.isArray(dto)) {
      return this.service.createMany(dto);
    }

    // If single object → createOne
    return this.service.createOne(dto);
  }

  @Get()
  async findAll(
    @Query("generic_id") generic_id: number,
    @Query("page") page: number,
    @Query("limit") limit: number
  ) {
    return this.service.findAll({
      generic_id: generic_id ? Number(generic_id) : undefined,
      page: Number(page) || 1,
      limit: Number(limit) || 50,
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
    @Body() dto: UpdateAttributeDto
  ) {
    if ((req as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }

    return this.service.update(Number(id), dto);
  }

  @Delete(":id")
  async remove(@Req() req: Request, @Param("id") id: string) {
    if ((req as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }

    return this.service.remove(Number(id));
  }
}
