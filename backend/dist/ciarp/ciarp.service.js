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
exports.CiarpService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const ciarp_schema_1 = require("./schemas/ciarp.schema");
const product_schema_1 = require("../products/schemas/product.schema");
let CiarpService = class CiarpService {
    ciarpModel;
    productModel;
    constructor(ciarpModel, productModel) {
        this.ciarpModel = ciarpModel;
        this.productModel = productModel;
    }
    async createRequest(docenteId, productId, tipoReconocimiento, puntosSolicitados, evidencias) {
        const product = await this.productModel.findById(productId);
        if (!product)
            throw new common_1.NotFoundException('Producto no encontrado');
        const newRequest = new this.ciarpModel({
            docenteId: new mongoose_2.Types.ObjectId(docenteId),
            productId: new mongoose_2.Types.ObjectId(productId),
            tipoReconocimiento,
            puntosSolicitados,
            evidencias
        });
        const savedRequest = await newRequest.save();
        product.status = product_schema_1.ProductStatus.EVALUACION_CIARP;
        await product.save();
        return savedRequest;
    }
    async getAllRequests() {
        return this.ciarpModel.find()
            .populate('docenteId', 'name email')
            .populate('productId', 'title type category uniqueId status')
            .sort({ createdAt: -1 });
    }
    async getMyRequests(docenteId) {
        return this.ciarpModel.find({ docenteId: new mongoose_2.Types.ObjectId(docenteId) })
            .populate('productId', 'title type status metadata')
            .sort({ createdAt: -1 });
    }
    async evaluateRequest(requestId, status, comentariosComite) {
        const request = await this.ciarpModel.findById(requestId);
        if (!request)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        request.status = status;
        request.comentariosComite = comentariosComite;
        await request.save();
        const product = await this.productModel.findById(request.productId);
        if (product) {
            if (status === ciarp_schema_1.CiarpStatus.APROBADO)
                product.status = product_schema_1.ProductStatus.APROBADO_CIARP;
            else if (status === ciarp_schema_1.CiarpStatus.RECHAZADO)
                product.status = product_schema_1.ProductStatus.RECHAZADO_CIARP;
            else
                product.status = product_schema_1.ProductStatus.RADICADO;
            await product.save();
        }
        return request;
    }
};
exports.CiarpService = CiarpService;
exports.CiarpService = CiarpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(ciarp_schema_1.CiarpRequest.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CiarpService);
//# sourceMappingURL=ciarp.service.js.map