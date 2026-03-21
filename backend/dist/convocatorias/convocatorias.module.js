"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvocatoriasModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const convocatorias_service_1 = require("./convocatorias.service");
const convocatorias_controller_1 = require("./convocatorias.controller");
const convocatoria_schema_1 = require("./schemas/convocatoria.schema");
const project_schema_1 = require("../projects/schemas/project.schema");
let ConvocatoriasModule = class ConvocatoriasModule {
};
exports.ConvocatoriasModule = ConvocatoriasModule;
exports.ConvocatoriasModule = ConvocatoriasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: convocatoria_schema_1.Convocatoria.name, schema: convocatoria_schema_1.ConvocatoriaSchema },
                { name: project_schema_1.Project.name, schema: project_schema_1.ProjectSchema },
            ]),
        ],
        controllers: [convocatorias_controller_1.ConvocatoriasController],
        providers: [convocatorias_service_1.ConvocatoriasService],
        exports: [convocatorias_service_1.ConvocatoriasService],
    })
], ConvocatoriasModule);
//# sourceMappingURL=convocatorias.module.js.map