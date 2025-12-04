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
import { GenericsService } from "./generics.service";
import { CreateGenericDto } from "./dto/create-generic.dto";
import { UpdateGenericDto } from "./dto/update-generic.dto";
import { Request } from "express";

@Controller("generics")
export class GenericsController {
  constructor(private readonly service: GenericsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateGenericDto) {
    if ((req as any).role !== "admin")
      throw new ForbiddenException("Admin only");
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("search") search: string,
    @Query("category_id") category_id: number,
    @Query("group_id") group_id: number
  ) {
    return this.service.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
      category_id: category_id ? Number(category_id) : undefined,
      group_id: group_id ? Number(group_id) : undefined,
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
    @Body() dto: UpdateGenericDto
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
