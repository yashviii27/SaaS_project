import { Module } from "@nestjs/common";
import { AttributeValuesService } from "./attribute-values.service";
import { AttributeValuesController } from "./attribute-values.controller";
import { PrismaService } from "../../common/prisma.service";

@Module({
  controllers: [AttributeValuesController],
  providers: [AttributeValuesService, PrismaService],
  exports: [AttributeValuesService],
})
export class AttributeValuesModule {}
