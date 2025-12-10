import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { BadRequestException } from "@nestjs/common";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    const exists = await this.prisma.category_master.findFirst({
      where: {
        category_name: data.category_name,
        group_id: data.group_id, // category must be unique *inside a group*
      },
    });

    if (exists) {
      throw new BadRequestException(
        "Category name already exists in this group"
      );
    }

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
  if (search)
    where.category_name = { contains: search, mode: "insensitive" };

  const total = await this.prisma.category_master.count({ where });

  const data = await this.prisma.category_master.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: "asc" },
  });

  // ❌ Remove group_id from each record (if needed)
  const cleanedData = data.map((c) => {
    const { group_id, ...rest } = c;
    return rest; // 🔥 No generics_count added
  });

  return {
    meta: { total, page, limit, pages: Math.ceil(total / limit) },
    data: cleanedData,
  };
}




  async findOne(id: number) {
  const cat = await this.prisma.category_master.findUnique({
    where: { id },
  });

  if (!cat) {
    throw new NotFoundException("Category not found");
  }

  // ❌ remove group_id from response
  const { group_id, ...cleanCategory } = cat;

  // ✅ return only category information
  return cleanCategory;
}

  async update(id: number, data: UpdateCategoryDto) {
    await this.findOne(id);

    if (data.category_name) {
      const exists = await this.prisma.category_master.findFirst({
        where: {
          category_name: data.category_name,
          group_id: data.group_id, // must match group
          NOT: { id }, // ignore current record
        },
      });

      if (exists) {
        throw new BadRequestException(
          "Category name already exists in this group"
        );
      }
    }

    return this.prisma.category_master.update({ where: { id }, data });
  }

async remove(id: number) {
  await this.findOne(id);

  // Check relations
  const links = await this.prisma.generic_master.count({
    where: { category_id: id },
  });

  if (links > 0) {
    throw new NotFoundException(
      "Category cannot be deleted because it is used in other records."
    );
  }

  return this.prisma.category_master.delete({ where: { id } });
}
}
