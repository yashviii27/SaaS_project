import { Module, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./common/prisma.service";
import { ApiKeyMiddleware } from "./common/api-key.middleware";

import { GroupsModule } from "./modules/groups/groups.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { GenericsModule } from "./modules/generics/generics.module";
import { BrandsModule } from "./modules/brands/brands.module";
import { ProductsModule } from "./modules/products/products.module";
import { AttributesModule } from "./modules/attributes/attributes.module";
import { AttributeValuesModule } from "./modules/attribute-values/attribute-values.module";
import { ProductAttributesModule } from "./modules/product-attributes/product-attributes.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GroupsModule,
    CategoriesModule,
    GenericsModule,
    BrandsModule,
    ProductsModule,
    AttributesModule,
    AttributeValuesModule,
    ProductAttributesModule,
    DashboardModule,
  ],
  providers: [PrismaService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes("*");
  }
}
