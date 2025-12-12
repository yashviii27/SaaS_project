import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ------------------------------------------------------------
  // CREATE CATEGORY
  // ------------------------------------------------------------
  async create(data: CreateCategoryDto) {
    // Check uniqueness (category_name must be globally unique now)
    const exists = await this.prisma.category_master.findFirst({
      where: { category_name: data.category_name },
    });

    if (exists) {
      throw new BadRequestException("Category name already exists");
    }

    return this.prisma.category_master.create({
      data: {
        category_name: data.category_name,
      },
    });
  }

  // ------------------------------------------------------------
  // LIST ALL CATEGORIES (with pagination + search)
  // ------------------------------------------------------------
  async findAll(params: { page?: number; limit?: number; search?: string }) {
    const { page = 1, limit = 20, search } = params;

    const where: any = {};

    // optional search
    if (search) {
      where.category_name = { contains: search, mode: "insensitive" };
    }

    const total = await this.prisma.category_master.count({ where });

    const data = await this.prisma.category_master.findMany({
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

  // ------------------------------------------------------------
  // GET SINGLE CATEGORY
  // ------------------------------------------------------------
  async findOne(id: number) {
    const cat = await this.prisma.category_master.findUnique({
      where: { id },
    });

    if (!cat) {
      throw new NotFoundException("Category not found");
    }

    return cat;
  }

  // ------------------------------------------------------------
  // UPDATE CATEGORY
  // ------------------------------------------------------------
  async update(id: number, data: UpdateCategoryDto) {
    await this.findOne(id); // ensure exists

    if (data.category_name) {
      const exists = await this.prisma.category_master.findFirst({
        where: {
          category_name: data.category_name,
          NOT: { id },
        },
      });

      if (exists) {
        throw new BadRequestException("Category name already exists");
      }
    }

    return this.prisma.category_master.update({
      where: { id },
      data: {
        category_name: data.category_name,
      },
    });
  }

  // ------------------------------------------------------------
  // DELETE CATEGORY
  // ------------------------------------------------------------
  async remove(id: number) {
    await this.findOne(id);

    // Prevent deleting if generics exist
    const linkedGenerics = await this.prisma.generic_master.count({
      where: { category_id: id },
    });

    if (linkedGenerics > 0) {
      throw new BadRequestException(
        "Category cannot be deleted because it is used in generic records."
      );
    }

    return this.prisma.category_master.delete({
      where: { id },
    });
  }
}
