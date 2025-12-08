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
  Res,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateProductDto) {
    if ((req as any).role !== "user") throw new ForbiddenException("User only");
    return this.service.create(dto);
  }

  @Get()
  async list(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(":id")
  async single(@Param("id") id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(":id")
  async update(
    @Req() req: Request,
    @Param("id") id: string,
    @Body() dto: UpdateProductDto
  ) {
    if ((req as any).role !== "user") throw new ForbiddenException("User only");
    return this.service.update(Number(id), dto);
  }

  @Delete(":id")
  async remove(@Req() req: Request, @Param("id") id: string) {
    if ((req as any).role !== "user") throw new ForbiddenException("User only");
    return this.service.remove(Number(id));
  }

  @Get("export")
  async export(@Res() res: Response, @Query() query: any) {
    return this.service.export(res, query);
  }
}
