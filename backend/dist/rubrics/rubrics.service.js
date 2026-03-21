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
exports.RubricsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const rubric_schema_1 = require("./schemas/rubric.schema");
let RubricsService = class RubricsService {
    rubricModel;
    constructor(rubricModel) {
        this.rubricModel = rubricModel;
    }
    async create(createRubricDto) {
        const createdRubric = new this.rubricModel(createRubricDto);
        return createdRubric.save();
    }
    async findAll() {
        return this.rubricModel.find().exec();
    }
    async findOne(id) {
        const rubric = await this.rubricModel.findById(id).exec();
        if (!rubric) {
            throw new common_1.NotFoundException(`Rubric #${id} not found`);
        }
        return rubric;
    }
    async update(id, updateRubricDto) {
        const updatedRubric = await this.rubricModel.findByIdAndUpdate(id, updateRubricDto, { new: true }).exec();
        if (!updatedRubric) {
            throw new common_1.NotFoundException(`Rubric #${id} not found`);
        }
        return updatedRubric;
    }
    async delete(id) {
        const deletedRubric = await this.rubricModel.findByIdAndDelete(id).exec();
        if (!deletedRubric) {
            throw new common_1.NotFoundException(`Rubric #${id} not found`);
        }
        return deletedRubric;
    }
};
exports.RubricsService = RubricsService;
exports.RubricsService = RubricsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(rubric_schema_1.Rubric.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RubricsService);
//# sourceMappingURL=rubrics.service.js.map