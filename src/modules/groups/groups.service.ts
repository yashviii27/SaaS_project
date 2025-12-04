import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGroupDto) {
    return this.prisma.group_master.create({ data });
  }

  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;
    const where = search
      ? { group_name: { contains: search, mode: "insensitive" } }
      : {};
    const total = await this.prisma.group_master.count({ where });
    const data = await this.prisma.group_master.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { id: "asc" },
    });

    // compute category counts
    const dataWithCounts = await Promise.all(
      data.map(async (g) => {
        const count = await this.prisma.category_master.count({
          where: { group_id: g.id },
        });
        return { ...g, category_count: count };
      })
    );

    return {
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
      data: dataWithCounts,
    };
  }

  async findOne(id: number) {
    const group = await this.prisma.group_master.findUnique({ where: { id } });
    if (!group) throw new NotFoundException("Group not found");
    const categories = await this.prisma.category_master.findMany({
      where: { group_id: id },
      take: 20,
    });
    return {
      ...group,
      categories_count: categories.length,
      categories: categories.slice(0, 10),
    };
  }

  async update(id: number, data: UpdateGroupDto) {
    await this.findOne(id);
    return this.prisma.group_master.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.group_master.delete({ where: { id } });
  }
}
