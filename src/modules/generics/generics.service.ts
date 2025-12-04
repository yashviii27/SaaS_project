import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateGenericDto } from "./dto/create-generic.dto";
import { UpdateGenericDto } from "./dto/update-generic.dto";

@Injectable()
export class GenericsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGenericDto) {
    return this.prisma.generic_master.create({ data });
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    group_id?: number;
  }) {
    const { page = 1, limit = 20, search, category_id, group_id } = params;
    const where: any = {};
    if (search) where.generic_name = { contains: search, mode: "insensitive" };
    if (category_id) where.category_id = category_id;
    if (group_id) where.group_id = group_id;

    const total = await this.prisma.generic_master.count({ where });
    const data = await this.prisma.generic_master.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
    });

    // include attribute count
    const dataWithCounts = await Promise.all(
      data.map(async (g) => {
        const count = await this.prisma.attribute_master.count({
          where: { generic_id: g.id },
        });
        return { ...g, attributes_count: count };
      })
    );

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: dataWithCounts,
    };
  }

  async findOne(id: number) {
    const gen = await this.prisma.generic_master.findUnique({
      where: { id },
      include: { attributes: true },
    });
    if (!gen) throw new NotFoundException("Generic not found");
    return gen;
  }

  async update(id: number, data: UpdateGenericDto) {
    await this.findOne(id);
    return this.prisma.generic_master.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.generic_master.delete({ where: { id } });
  }
}
