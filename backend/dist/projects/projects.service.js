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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
let ProjectsService = class ProjectsService {
    projectModel;
    constructor(projectModel) {
        this.projectModel = projectModel;
    }
    async create(createProjectDto, userId) {
        const createdProject = new this.projectModel({
            ...createProjectDto,
            investigadorPrincipal: userId,
        });
        return createdProject.save();
    }
    async findAllByUserId(userId) {
        return this.projectModel.find({ investigadorPrincipal: userId }).populate('convocatoria', 'title year _id rubricId').exec();
    }
    async findMyEvaluations(userId) {
        return this.projectModel.find({ "evaluations.evaluator": userId })
            .populate('investigadorPrincipal', 'name email identificationNumber')
            .populate({
            path: 'convocatoria',
            select: 'title year number rubricId dynamicFields',
            populate: {
                path: 'rubricId',
                model: 'Rubric'
            }
        })
            .exec();
    }
    async findAllByConvocatoria(convocatoriaId) {
        return this.projectModel.find({ convocatoria: convocatoriaId })
            .populate('investigadorPrincipal', 'name email identificationNumber facultad programa')
            .populate('group', 'name')
            .populate('evaluations.evaluator', 'name email role')
            .exec();
    }
    async assignEvaluators(projectId, evaluatorIds) {
        const project = await this.projectModel.findById(projectId).exec();
        if (!project)
            throw new common_1.NotFoundException('Proyecto no encontrado');
        const existingEvalIds = project.evaluations?.map(e => e.evaluator.toString()) || [];
        const newEvals = evaluatorIds
            .filter(id => !existingEvalIds.includes(id))
            .map(id => ({ evaluator: id, status: 'pendiente', scores: {}, comments: '', totalScore: 0 }));
        if (newEvals.length > 0) {
            if (!project.evaluations)
                project.evaluations = [];
            project.evaluations.push(...newEvals);
            await project.save();
        }
        return this.projectModel.findById(projectId)
            .populate('investigadorPrincipal', 'name email identificationNumber')
            .populate('evaluations.evaluator', 'name email role')
            .exec();
    }
    async submitEvaluation(projectId, evaluatorId, result) {
        const project = await this.projectModel.findById(projectId).exec();
        if (!project)
            throw new common_1.NotFoundException('Proyecto no encontrado');
        if (!project.evaluations)
            project.evaluations = [];
        const evalIndex = project.evaluations.findIndex(e => e.evaluator.toString() === evaluatorId);
        if (evalIndex === -1)
            throw new common_1.NotFoundException('No estás asignado como evaluador a este proyecto');
        const totalScore = Object.values(result.scores).reduce((a, b) => a + Number(b), 0);
        project.evaluations[evalIndex].scores = result.scores;
        project.evaluations[evalIndex].comments = result.comments;
        project.evaluations[evalIndex].totalScore = totalScore;
        project.evaluations[evalIndex].status = result.status || 'evaluado';
        project.markModified('evaluations');
        return project.save();
    }
    async resolveProject(projectId, status, resolutionComments, userId) {
        const project = await this.projectModel.findById(projectId).exec();
        if (!project)
            throw new common_1.NotFoundException('Proyecto no encontrado');
        project.status = status;
        if (resolutionComments) {
            project.resolutionComments = resolutionComments;
        }
        return project.save();
    }
    async findOne(id) {
        const project = await this.projectModel.findById(id).populate('convocatoria').exec();
        if (!project)
            throw new common_1.NotFoundException('Proyecto no encontrado');
        return project;
    }
    async update(id, updateData, userId) {
        const project = await this.projectModel.findOneAndUpdate({ _id: id, investigadorPrincipal: userId }, updateData, { new: true }).exec();
        if (!project)
            throw new common_1.NotFoundException('Proyecto no encontrado o no tienes permiso');
        return project;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map