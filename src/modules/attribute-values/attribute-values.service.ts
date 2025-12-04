import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateAttributeValueDto } from "./dto/create-attribute-value.dto";
import { UpdateAttributeValueDto } from "./dto/update-attribute-value.dto";

@Injectable()
export class AttributeValuesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAttributeValueDto) {
    return this.prisma.attribute_values_master.create({ data });
  }

  async findAll(params: {
    attribute_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { attribute_id, page = 1, limit = 100 } = params;
    const where: any = {};
    if (attribute_id) where.attribute_id = attribute_id;
    const total = await this.prisma.attribute_values_master.count({ where });
    const data = await this.prisma.attribute_values_master.findMany({
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
    const item = await this.prisma.attribute_values_master.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException("Attribute value not found");
    return item;
  }

  async update(id: number, data: UpdateAttributeValueDto) {
    await this.findOne(id);
    return this.prisma.attribute_values_master.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.attribute_values_master.delete({ where: { id } });
  }
}
