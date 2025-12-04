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
import { BrandsService } from "./brands.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@Controller("brands")
export class BrandsController {
  constructor(private readonly service: BrandsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateBrandDto) {
    if ((req as any).role !== "admin")
      throw new ForbiddenException("Admin only");
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("search") search: string
  ) {
    return this.service.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
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
    @Body() dto: UpdateBrandDto
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
