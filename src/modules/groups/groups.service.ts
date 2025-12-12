import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // --------------------------------------------
  // CREATE GROUP
  // --------------------------------------------
  async create(data: CreateGroupDto) {
    const exist = await this.prisma.group_master.findFirst({
      where: { group_name: data.group_name },
    });

    if (exist) {
      throw new BadRequestException("Group name already exists");
    }

    return this.prisma.group_master.create({
      data: {
        group_name: data.group_name,
      },
    });
  }

  // --------------------------------------------
  // FIND ALL
  // --------------------------------------------
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
      data,
    };
  }

  // --------------------------------------------
  // FIND ONE
  // --------------------------------------------
  async findOne(id: number): Promise<any> {
    const group = await this.prisma.group_master.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    return {
      id: group.id,
      group_name: group.group_name,
      created_at: group.created_at,
      updated_at: group.updated_at,
    };
  }

  // --------------------------------------------
  // UPDATE GROUP
  // --------------------------------------------
  async update(id: number, data: UpdateGroupDto) {
    await this.findOne(id);

    if (data.group_name) {
      const exists = await this.prisma.group_master.findFirst({
        where: {
          group_name: data.group_name,
          NOT: { id },
        },
      });

      if (exists) {
        throw new BadRequestException("Group name already exists");
      }
    }

    const cleanData: any = {};
    if (data.group_name) cleanData.group_name = data.group_name;

    return this.prisma.group_master.update({
      where: { id },
      data: cleanData,
    });
  }

  // --------------------------------------------
  // DELETE GROUP (Block only if generics belong)
  // --------------------------------------------
  async remove(id: number) {
    const group = await this.prisma.group_master.findUnique({
      where: { id },
    });

    if (!group) {
      throw new NotFoundException("Group not found");
    }

    // Check generics linked to this group
    const genericsCount = await this.prisma.generic_master.count({
      where: { group_id: id },
    });

    if (genericsCount > 0) {
      throw new BadRequestException(
        "Cannot delete group because it has related generics."
      );
    }

    return this.prisma.group_master.delete({
      where: { id },
    });
  }
}
