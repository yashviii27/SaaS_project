import { Module } from "@nestjs/common";
import { ProductAttributesService } from "./product-attributes.service";
import { ProductAttributesController } from "./product-attributes.controller";
import { PrismaService } from "../../common/prisma.service";

@Module({
  controllers: [ProductAttributesController],
  providers: [ProductAttributesService, PrismaService],
  exports: [ProductAttributesService],
})
export class ProductAttributesModule {}
