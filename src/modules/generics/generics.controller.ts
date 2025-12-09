import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from "@nestjs/common";
import { GenericsService } from "./generics.service";
// import { AdminGuard } from "../auth/admin.guard";

import { AdminGuard } from "../../guards/admin.guard";


@Controller("generics")
export class GenericsController {
  constructor(private readonly service: GenericsService) {}

  // ⭐ ADMIN ONLY — Create generic + its attributes + values
  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() dto: any) {
    return this.service.createGeneric(dto);
  }

  // ⭐ ADMIN ONLY — Update
  @Put(":id")
  @UseGuards(AdminGuard)
  async update(@Param("id") id: string, @Body() dto: any) {
    return this.service.update(Number(id), dto);
  }

  // ⭐ ADMIN ONLY — Delete
  @Delete(":id")
  @UseGuards(AdminGuard)
  async remove(@Param("id") id: string) {
    return this.service.remove(Number(id));
  }

  // ⭐ USER + ADMIN — Can view
  @Get()
  async findAll(@Query() query) {
    return this.service.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.service.findOne(Number(id));
  }
}
