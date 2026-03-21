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
exports.ConvocatoriasService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const convocatoria_schema_1 = require("./schemas/convocatoria.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
let ConvocatoriasService = class ConvocatoriasService {
    convocatoriaModel;
    projectModel;
    constructor(convocatoriaModel, projectModel) {
        this.convocatoriaModel = convocatoriaModel;
        this.projectModel = projectModel;
    }
    async create(createConvocatoriaDto) {
        const created = new this.convocatoriaModel(createConvocatoriaDto);
        return created.save();
    }
    async findAll() {
        return this.convocatoriaModel.find().sort({ createdAt: -1 }).exec();
    }
    async findOne(id) {
        const convo = await this.convocatoriaModel.findById(id).exec();
        if (!convo)
            throw new common_1.NotFoundException('Convocatoria no encontrada');
        return convo;
    }
    async update(id, updateConvocatoriaDto) {
        const existing = await this.convocatoriaModel.findByIdAndUpdate(id, updateConvocatoriaDto, { new: true }).exec();
        if (!existing)
            throw new common_1.NotFoundException('Convocatoria no encontrada');
        return existing;
    }
    async remove(id) {
        const projectsCount = await this.projectModel.countDocuments({ convocatoria: id }).exec();
        if (projectsCount > 0) {
            throw new common_1.BadRequestException('No se puede eliminar la convocatoria porque ya hay investigadores participando en ella con proyectos radicados.');
        }
        const deleted = await this.convocatoriaModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Convocatoria no encontrada');
        return deleted;
    }
};
exports.ConvocatoriasService = ConvocatoriasService;
exports.ConvocatoriasService = ConvocatoriasService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(convocatoria_schema_1.Convocatoria.name)),
    __param(1, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ConvocatoriasService);
//# sourceMappingURL=convocatorias.service.js.map