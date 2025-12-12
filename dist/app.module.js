"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("./common/prisma.service");
const groups_module_1 = require("./modules/groups/groups.module");
const categories_module_1 = require("./modules/categories/categories.module");
const generics_module_1 = require("./modules/generics/generics.module");
const brands_module_1 = require("./modules/brands/brands.module");
const products_module_1 = require("./modules/products/products.module");
const attributes_module_1 = require("./modules/attributes/attributes.module");
const attribute_values_module_1 = require("./modules/attribute-values/attribute-values.module");
const product_attributes_module_1 = require("./modules/product-attributes/product-attributes.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const auth_middleware_1 = require("./common/auth.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(auth_middleware_1.AuthMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            groups_module_1.GroupsModule,
            categories_module_1.CategoriesModule,
            generics_module_1.GenericsModule,
            brands_module_1.BrandsModule,
            products_module_1.ProductsModule,
            attributes_module_1.AttributesModule,
            attribute_values_module_1.AttributeValuesModule,
            product_attributes_module_1.ProductAttributesModule,
            dashboard_module_1.DashboardModule,
        ],
        providers: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map