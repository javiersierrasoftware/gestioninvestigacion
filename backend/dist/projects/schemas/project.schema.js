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
exports.ProjectSchema = exports.Project = exports.ProjectEvaluationSchema = exports.ProjectEvaluation = exports.ProjectStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["BORRADOR"] = "borrador";
    ProjectStatus["RADICADO"] = "radicado";
    ProjectStatus["EN_REVISION"] = "en_revision";
    ProjectStatus["APROBADO"] = "aprobado";
    ProjectStatus["RECHAZADO"] = "rechazado";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
let ProjectEvaluation = class ProjectEvaluation {
    evaluator;
    status;
    scores;
    criterionComments;
    comments;
    totalScore;
};
exports.ProjectEvaluation = ProjectEvaluation;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], ProjectEvaluation.prototype, "evaluator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'pendiente' }),
    __metadata("design:type", String)
], ProjectEvaluation.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ProjectEvaluation.prototype, "scores", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], ProjectEvaluation.prototype, "criterionComments", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], ProjectEvaluation.prototype, "comments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ProjectEvaluation.prototype, "totalScore", void 0);
exports.ProjectEvaluation = ProjectEvaluation = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ProjectEvaluation);
exports.ProjectEvaluationSchema = mongoose_1.SchemaFactory.createForClass(ProjectEvaluation);
let Project = class Project {
    title;
    summary;
    convocatoria;
    investigadorPrincipal;
    executionMonths;
    group;
    participatingGroups;
    teamMembers;
    dynamicResponses;
    status;
    resolutionComments;
    evaluations;
};
exports.Project = Project;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Project.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Project.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Convocatoria', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "convocatoria", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "investigadorPrincipal", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Number, default: 0 }),
    __metadata("design:type", Number)
], Project.prototype, "executionMonths", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Group' }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Project.prototype, "group", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Types.ObjectId, ref: 'Group' }] }),
    __metadata("design:type", Array)
], Project.prototype, "participatingGroups", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{
                user: { type: mongoose_2.Types.ObjectId, ref: 'User', required: false },
                name: { type: String, required: false },
                identificationNumber: { type: String, required: false },
                role: { type: String, required: true },
                hoursPerMonth: { type: Number, default: 0 },
                hourlyRate: { type: Number, default: 0 },
                months: { type: Number, default: 0 },
                isContrapartida: { type: Boolean, default: false },
            }],
        default: []
    }),
    __metadata("design:type", Array)
], Project.prototype, "teamMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Project.prototype, "dynamicResponses", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.BORRADOR }),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Project.prototype, "resolutionComments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProjectEvaluationSchema], default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "evaluations", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
//# sourceMappingURL=project.schema.js.map