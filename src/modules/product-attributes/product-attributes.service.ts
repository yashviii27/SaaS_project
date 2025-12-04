import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateProductAttributeDto } from "./dto/create-product-attribute.dto";
import { UpdateProductAttributeDto } from "./dto/update-product-attribute.dto";

@Injectable()
export class ProductAttributesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductAttributeDto) {
    // optionally validate attribute/product existence
    return this.prisma.product_attribute_values.create({ data });
  }

  async findAll(params: {
    product_id?: number;
    attribute_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { product_id, attribute_id, page = 1, limit = 100 } = params;
    const where: any = {};
    if (product_id) where.product_id = product_id;
    if (attribute_id) where.attribute_id = attribute_id;
    const total = await this.prisma.product_attribute_values.count({ where });
    const data = await this.prisma.product_attribute_values.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
    });
    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data,
    };
  }

  async findOne(id: number) {
    const item = await this.prisma.product_attribute_values.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException("Product attribute not found");
    return item;
  }

  async update(id: number, data: UpdateProductAttributeDto) {
    await this.findOne(id);
    return this.prisma.product_attribute_values.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product_attribute_values.delete({ where: { id } });
  }
}
