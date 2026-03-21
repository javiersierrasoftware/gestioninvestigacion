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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
let ProductsService = class ProductsService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async create(userId, createProductDto) {
        if (createProductDto.uniqueId) {
            const existing = await this.productModel.findOne({ uniqueId: createProductDto.uniqueId });
            if (existing) {
                throw new common_1.ConflictException({
                    message: 'ALERTA DE DUPLICIDAD: Ya existe un producto registrado en la universidad con este identificador único (D.O.I, ISBN/ISSN). Si usted es coautor, contacte al docente que lo subió para que lo vincule en su equipo de autores.',
                    existingId: existing._id
                });
            }
        }
        const authors = createProductDto.authors || [];
        if (!authors.some(a => a.user?.toString() === userId)) {
        }
        const newProduct = new this.productModel({
            ...createProductDto,
            createdBy: userId,
            status: createProductDto.status || product_schema_1.ProductStatus.BORRADOR
        });
        return newProduct.save();
    }
    async findMyProducts(userId) {
        return this.productModel.find({
            $or: [
                { createdBy: userId },
                { 'authors.user': userId }
            ]
        })
            .populate('authors.user', 'name email facultad')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findAll() {
        return this.productModel.find().populate('authors.user', 'name email facultad group').sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const product = await this.productModel.findById(id).populate('authors.user', 'name email facultad').exec();
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        return product;
    }
    async update(id, userId, updateData) {
        const product = await this.productModel.findById(id);
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (product.createdBy.toString() !== userId && !product.authors.some(a => a.user?.toString() === userId)) {
            throw new common_1.ConflictException('No tienes permisos para editar este producto');
        }
        if (updateData.uniqueId && updateData.uniqueId !== product.uniqueId) {
            const existing = await this.productModel.findOne({ uniqueId: updateData.uniqueId });
            if (existing)
                throw new common_1.ConflictException('El identificador único ya está en uso por otro producto.');
        }
        Object.assign(product, updateData);
        return product.save();
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map