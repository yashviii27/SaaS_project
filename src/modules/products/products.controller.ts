import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Req,
  Query,
  ForbiddenException,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";

@Controller("products")
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Post()
  async create(@Req() req: any, @Body() dto: CreateProductDto) {
    if (req.role !== "user")
      throw new ForbiddenException("Only users can add products");

    return this.service.create(dto);
  }

  @Get()
  findAll(@Req() req: any, @Query() query: any) {
    return this.service.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(Number(id));
  }

  @Put(":id")
  async update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateProductDto) {
    if (req.role !== "user")
      throw new ForbiddenException("Only users can update products");

    return this.service.update(Number(id), dto);
  }

  @Delete(":id")
  async remove(@Req() req: any, @Param("id") id: string) {
    if (req.role !== "user")
      throw new ForbiddenException("Only users can delete products");

    return this.service.remove(Number(id));
  }
}
