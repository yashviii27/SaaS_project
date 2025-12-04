import { Module } from "@nestjs/common";
import { GenericsService } from "./generics.service";
import { GenericsController } from "./generics.controller";
import { PrismaService } from "../../common/prisma.service";

@Module({
  controllers: [GenericsController],
  providers: [GenericsService, PrismaService],
  exports: [GenericsService],
})
export class GenericsModule {}
