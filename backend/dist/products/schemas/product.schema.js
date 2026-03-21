"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductSchema = exports.Product = exports.ProductStatus = exports.ProductCategory = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["ACADEMICO"] = "acad\u00E9mico";
    ProductCategory["INVESTIGACION"] = "investigaci\u00F3n";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["BORRADOR"] = "borrador";
    ProductStatus["RADICADO"] = "radicado";
    ProductStatus["EVALUACION_CIARP"] = "evaluaci\u00F3n_ciarp";
    ProductStatus["APROBADO_CIARP"] = "aprobado_ciarp";
    ProductStatus["RECHAZADO_CIARP"] = "rechazado_ciarp";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
let Product = class Product {
    title;
    category;
    type;
    authors;
    uniqueId;
    metadata;
    status;
    createdBy;
};
exports.Product = Product;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Product.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: Object.values(ProductCategory) }),
    __metadata("design:type", String)
], Product.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Product.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ user: { type: mongoose_2.Types.ObjectId, ref: 'User' }, name: String, isExternal: Boolean }], default: [] }),
    __metadata("design:type", Array)
], Product.prototype, "authors", void 0);
__decorate([
    (0, mongoose_1.Prop)({ unique: true, sparse: true }),
    __metadata("design:type", String)
], Product.prototype, "uniqueId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Product.prototype, "metadata", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(ProductStatus), default: ProductStatus.BORRADOR }),
    __metadata("design:type", String)
], Product.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Product.prototype, "createdBy", void 0);
exports.Product = Product = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Product);
exports.ProductSchema = mongoose_1.SchemaFactory.createForClass(Product);
//# sourceMappingURL=product.schema.js.map