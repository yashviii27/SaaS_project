import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../common/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async summary() {
    const groups = await this.prisma.group_master.count();
    const categories = await this.prisma.category_master.count();
    const generics = await this.prisma.generic_master.count();
    const brands = await this.prisma.brand_master.count();
    const products = await this.prisma.product_master.count();
    const lowStock = await this.prisma.product_master.findMany({
      where: { qty: { lt: 5 } },
      take: 10,
    });

    return { groups, categories, generics, brands, products, lowStock };
  }
}
