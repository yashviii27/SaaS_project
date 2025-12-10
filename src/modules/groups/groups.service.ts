import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateGroupDto) {
    const exist = await this.prisma.group_master.findFirst({
      where: { group_name: data.group_name },
    });

    if (exist) {
      throw new BadRequestException("Group name already exists");
    }

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

    return {
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      data, // Only group info
    };
  }

  async findOne(id: number) {
    const group = await this.prisma.group_master.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    // Return only group info (no categories)
    return {
      id: group.id,
      group_name: group.group_name,
      created_at: group.created_at,
      updated_at: group.updated_at,
    };
  }

  async update(id: number, data: UpdateGroupDto) {
    await this.findOne(id);

    if (data.group_name) {
      const exists = await this.prisma.group_master.findFirst({
        where: {
          group_name: data.group_name,
          NOT: { id }, // exclude current record
        },
      });

      if (exists) {
        throw new BadRequestException("Group name already exists");
      }
    }

    return this.prisma.group_master.update({ where: { id }, data });
  }

  // --------------------------------------------
  // ❌ BLOCK DELETE IF GROUP HAS CATEGORIES
  // --------------------------------------------
  async remove(id: number) {
    // 1️⃣ Ensure group exists
    const group = await this.prisma.group_master.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    // 2️⃣ Check if any categories are linked to this group
    const categoryCount = await this.prisma.category_master.count({
      where: { group_id: id },
    });

    if (categoryCount > 0) {
      throw new BadRequestException(
        "Cannot delete group because it has related categories."
      );
    }

    // 3️⃣ Safe to delete (no categories)
    return this.prisma.group_master.delete({
      where: { id },
    });
  }
}
