"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGenericDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_generic_dto_1 = require("./create-generic.dto");
class UpdateGenericDto extends (0, mapped_types_1.PartialType)(create_generic_dto_1.CreateGenericDto) {
}
exports.UpdateGenericDto = UpdateGenericDto;
//# sourceMappingURL=update-generic.dto.js.map