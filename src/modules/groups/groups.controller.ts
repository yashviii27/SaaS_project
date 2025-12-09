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
import { GroupsService } from "./groups.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { Request } from "express";

@Controller("groups")
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  // ---------------------- ADMIN ONLY ----------------------
  @Post()
  async create(@Req() req: Request, @Body() dto: CreateGroupDto) {
    if ((req as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }
    return this.groupsService.create(dto);
  }

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateGroupDto
  ) {
    if ((req as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }
    return this.groupsService.update(Number(id), dto);
  }

  @Delete(":id")
  async remove(@Req() req: Request, @Param("id") id: string) {
    if ((req as any).role !== "admin") {
      throw new ForbiddenException("Admin only");
    }
    return this.groupsService.remove(Number(id));
  }

  // ---------------------- PUBLIC (ADMIN + USER) ----------------------
  @Get()
  async findAll(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("search") search: string
  ) {
    return this.groupsService.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      search,
    });
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.groupsService.findOne(Number(id));
  }
}
