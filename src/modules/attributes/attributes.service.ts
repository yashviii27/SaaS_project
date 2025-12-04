import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateAttributeDto } from "./dto/create-attribute.dto";
import { UpdateAttributeDto } from "./dto/update-attribute.dto";

@Injectable()
export class AttributesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAttributeDto) {
    return this.prisma.attribute_master.create({ data });
  }

  async findAll(params: {
    generic_id?: number;
    page?: number;
    limit?: number;
  }) {
    const { generic_id, page = 1, limit = 50 } = params;
    const where: any = {};
    if (generic_id) where.generic_id = generic_id;
    const total = await this.prisma.attribute_master.count({ where });
    const data = await this.prisma.attribute_master.findMany({
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
    const item = await this.prisma.attribute_master.findUnique({
      where: { id },
      include: { values: true },
    });
    if (!item) throw new NotFoundException("Attribute not found");
    return item;
  }

  async update(id: number, data: UpdateAttributeDto) {
    await this.findOne(id);
    return this.prisma.attribute_master.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.attribute_master.delete({ where: { id } });
  }
}
