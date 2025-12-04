import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    return this.prisma.category_master.create({ data });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    group_id?: number;
    search?: string;
  }) {
    const { page = 1, limit = 20, group_id, search } = params;
    const where: any = {};
    if (group_id) where.group_id = group_id;
    if (search) where.category_name = { contains: search, mode: "insensitive" };

    const total = await this.prisma.category_master.count({ where });
    const data = await this.prisma.category_master.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
    });

    // include generics count
    const dataWithCounts = await Promise.all(
      data.map(async (c) => {
        const count = await this.prisma.generic_master.count({
          where: { category_id: c.id },
        });
        return { ...c, generics_count: count };
      })
    );

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: dataWithCounts,
    };
  }

  async findOne(id: number) {
    const cat = await this.prisma.category_master.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException("Category not found");
    const generics = await this.prisma.generic_master.findMany({
      where: { category_id: id },
      take: 20,
    });
    return {
      ...cat,
      generics_count: generics.length,
      generics: generics.slice(0, 10),
    };
  }

  async update(id: number, data: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category_master.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.category_master.delete({ where: { id } });
  }
}
