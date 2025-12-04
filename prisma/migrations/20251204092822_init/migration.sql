-- DropIndex
DROP INDEX `attribute_master_generic_id_fkey` ON `attribute_master`;

-- DropIndex
DROP INDEX `attribute_values_master_attribute_id_fkey` ON `attribute_values_master`;

-- DropIndex
DROP INDEX `category_master_group_id_fkey` ON `category_master`;

-- DropIndex
DROP INDEX `generic_master_category_id_fkey` ON `generic_master`;

-- DropIndex
DROP INDEX `generic_master_group_id_fkey` ON `generic_master`;

-- DropIndex
DROP INDEX `product_attribute_values_attribute_id_fkey` ON `product_attribute_values`;

-- DropIndex
DROP INDEX `product_attribute_values_product_id_fkey` ON `product_attribute_values`;

-- DropIndex
DROP INDEX `product_master_brand_id_fkey` ON `product_master`;

-- DropIndex
DROP INDEX `product_master_generic_id_fkey` ON `product_master`;

-- AddForeignKey
ALTER TABLE `category_master` ADD CONSTRAINT `category_master_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `generic_master` ADD CONSTRAINT `generic_master_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `group_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `generic_master` ADD CONSTRAINT `generic_master_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `category_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_master` ADD CONSTRAINT `product_master_generic_id_fkey` FOREIGN KEY (`generic_id`) REFERENCES `generic_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_master` ADD CONSTRAINT `product_master_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brand_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_master` ADD CONSTRAINT `attribute_master_generic_id_fkey` FOREIGN KEY (`generic_id`) REFERENCES `generic_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_values_master` ADD CONSTRAINT `attribute_values_master_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute_master`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
