import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { UpdateBrandDto } from "./dto/update-brand.dto";

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBrandDto) {
    return this.prisma.brand_master.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const where = search
      ? { brand_name: { contains: search, mode: "insensitive" } }
      : {};
    const total = await this.prisma.brand_master.count({ where });
    const data = await this.prisma.brand_master.findMany({
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
    const brand = await this.prisma.brand_master.findUnique({ where: { id } });
    if (!brand) throw new NotFoundException("Brand not found");
    return brand;
  }

  async update(id: number, data: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand_master.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.brand_master.delete({ where: { id } });
  }
}
