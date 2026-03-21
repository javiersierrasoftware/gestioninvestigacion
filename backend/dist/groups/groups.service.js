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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const group_schema_1 = require("./schemas/group.schema");
let GroupsService = class GroupsService {
    groupModel;
    constructor(groupModel) {
        this.groupModel = groupModel;
    }
    async create(createGroupDto) {
        const createdGroup = new this.groupModel(createGroupDto);
        return createdGroup.save();
    }
    async findAll() {
        return this.groupModel.find().sort({ name: 1 }).exec();
    }
    async findOne(id) {
        return this.groupModel.findById(id).exec();
    }
    async update(id, updateGroupDto) {
        return this.groupModel.findByIdAndUpdate(id, updateGroupDto, { new: true }).exec();
    }
    async remove(id) {
        return this.groupModel.findByIdAndDelete(id).exec();
    }
    async seedGroups() {
        const count = await this.groupModel.countDocuments();
        if (count > 0)
            return { message: 'Base de datos de grupos ya poblada' };
        const groupsData = [
            { name: 'ANÁLISIS FUNCIONAL Y ECUACIONES DIFERENCIALES-AFED', categoria: 'A1', leaderName: 'OSMIN FERRER VILLAR', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'BIOLOGIA EVOLUTIVA', categoria: 'C', leaderName: 'LILIANA SOLANO FLOREZ', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'SALUD – GINDES', categoria: 'C', leaderName: 'MARA OSORNO NAVARRO', facultad: 'CIENCIAS DE LA SALUD' },
            { name: 'CUIDADO DE LA SALUD', categoria: 'C', leaderName: 'ADRIANA CONTRERAS', facultad: 'CIENCIAS DE LA SALUD' },
            { name: 'FONOCIENCIA', categoria: 'C', leaderName: 'MARIVEL MONTES ROTELA', facultad: 'CIENCIAS DE LA SALUD' },
            { name: 'GRUPO INTERDISCIPLINAR DE FÍSICA TEÓRICA Y APLICADA (GIFTA)', categoria: 'C', leaderName: 'WILSON ROSADO MERCADO', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'REPRODUCCIÓN Y MEJORAMIENTO GENÉTICO ANIMAL', categoria: 'A', leaderName: 'DONICER EDUARDO MONTES VERGARA', facultad: 'CIENCIAS AGROPECUARIAS' },
            { name: 'BIODIVERSIDAD TROPICAL', categoria: 'C', leaderName: 'ALCIDES CASIMIRO SAMPEDRO MARIN', facultad: 'CIENCIAS AGROPECUARIAS' },
            { name: 'BIOPROSPECCION AGROPECUARIA', categoria: 'A', leaderName: 'ALEXANDER PEREZ CORDERO', facultad: 'CIENCIAS AGROPECUARIAS' },
            { name: 'ESTRATEGIA Y GESTIÓN', categoria: 'A', leaderName: 'CARLOS MIGUEL PACHECO RUIZ', facultad: 'CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS' },
            { name: 'GESTIÓN DE LA PRODUCCIÓN Y LA CALIDAD ORGANIZACIONAL', categoria: 'C', leaderName: 'ALVARO ENRIQUE SANTAMARIA ESCOBAR', facultad: 'CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS' },
            { name: 'OIKOS', categoria: 'A', leaderName: 'LEON JULIO ARANGO BUELVAS', facultad: 'CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS' },
            { name: 'PROCESOS AGROINDUSTRIALES Y DE DESARROLLO SOTENIBLE – PADES', categoria: 'A', leaderName: 'JAIRO GUADALUPE SALCEDO MENDOZA', facultad: 'INGENIERIA' },
            { name: 'DESARROLLO E INNOVACIÓN DE PROCESOS ALIMENTARIOS - DESINPA', categoria: 'C', leaderName: 'MARIA TAVERA QUIROZ', facultad: 'INGENIERIA' },
            { name: 'GESTIÓN INTEGRAL DE PROCESOS, MEDIO AMBIENTE Y CALIDAD - GIMAC', categoria: 'C', leaderName: 'YELITZA AGUAS MENDOZA', facultad: 'INGENIERIA' },
            { name: 'GRESA', categoria: 'C', leaderName: 'ALFREDO FERNANDEZ QUINTERO', facultad: 'INGENIERIA' },
            { name: 'GRUPO DE INVESTIGACION MANGLAR', categoria: 'B', leaderName: 'JAVIER EMILIO SIERRA', facultad: 'INGENIERIA' },
            { name: 'GIGEVIS: GEOTECNIA, VÍAS Y SANITARIA', categoria: 'C', leaderName: 'JHON JAIRO FERIA', facultad: 'INGENIERIA' },
            { name: 'ESTROPTI', categoria: 'C', leaderName: 'CARLOS MILLÁN', facultad: 'INGENIERIA' },
            { name: 'BIOINDUSTRIAS', categoria: 'C', leaderName: 'QUELBIS ROMÁN QUINTERO BERTEL', facultad: 'INGENIERIA' },
            { name: 'ZOOLOGIA Y ECOLOGIA DE LA UNIVERSIDAD DE SUCRE', categoria: 'A', leaderName: 'DEIVYS MOISES ALVAREZ GARCIA', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'DIDÁCTICA DE LAS CIENCIAS, DIDAK-CIENCIAS', categoria: 'A', leaderName: 'ALBERTO DE JESUS PUPO IRIARTE', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'CIENCIAS MEDICAS Y FARMACEUTICAS', categoria: 'A', leaderName: 'NERLIS PAOLA PAJARO CASTRO', facultad: 'CIENCIAS DE LA SALUD' },
            { name: 'PENSAMIENTO MATEMÁTICO-PEMA', categoria: 'A', leaderName: 'JAIRO ESCORCIA MERCADO', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'SODEHUPAZ', categoria: 'A', leaderName: 'OSCAR ANDRÉS DONCEL', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'INVESTIGACIÓN E INNOVACIÓN EN AMBIENTE Y SALUD', categoria: 'A', leaderName: 'PEDRO JOSÉ BLANCO TUIRAN', facultad: 'EDUCACIÓN Y CIENCIAS' },
            { name: 'GIMAGUAS', categoria: 'A', leaderName: 'GUILLERMO GUTIERREZ RIBBON', facultad: 'INGENIERIA' },
            { name: 'GRUPO DE INVESTIGACIÓN E INNOVACIÓN EN ELECTRÓNICA (GINELECT)', categoria: 'A', leaderName: 'RAMON ANTONIO ALVAREZ LOPEZ', facultad: 'INGENIERIA' },
            { name: 'CLINICA EN MEDICINA-GICLIM', categoria: 'A', leaderName: 'EDGAR VERGARA DAGOBETH', facultad: 'CIENCIAS DE LA SALUD' }
        ];
        return this.groupModel.insertMany(groupsData);
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(group_schema_1.Group.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], GroupsService);
//# sourceMappingURL=groups.service.js.map