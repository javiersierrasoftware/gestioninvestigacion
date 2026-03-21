"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConvocatoriaSchema = exports.Convocatoria = exports.DynamicFieldSchema = exports.DynamicField = exports.FieldType = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose = __importStar(require("mongoose"));
var FieldType;
(function (FieldType) {
    FieldType["TEXT"] = "text";
    FieldType["TEXTAREA"] = "textarea";
    FieldType["NUMBER"] = "number";
    FieldType["FILE"] = "file";
    FieldType["DATE"] = "date";
    FieldType["TABLE"] = "table";
})(FieldType || (exports.FieldType = FieldType = {}));
let DynamicField = class DynamicField {
    name;
    label;
    helpText;
    placeholder;
    type;
    required;
    options;
    columns;
};
exports.DynamicField = DynamicField;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DynamicField.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], DynamicField.prototype, "label", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: '' }),
    __metadata("design:type", String)
], DynamicField.prototype, "helpText", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], DynamicField.prototype, "placeholder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: FieldType, required: true }),
    __metadata("design:type", String)
], DynamicField.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DynamicField.prototype, "required", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DynamicField.prototype, "options", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], DynamicField.prototype, "columns", void 0);
exports.DynamicField = DynamicField = __decorate([
    (0, mongoose_1.Schema)()
], DynamicField);
exports.DynamicFieldSchema = mongoose_1.SchemaFactory.createForClass(DynamicField);
let Convocatoria = class Convocatoria {
    title;
    number;
    year;
    directedTo;
    budgetPerProject;
    description;
    startDate;
    endDate;
    dynamicFields;
    isActive;
    rubricId;
};
exports.Convocatoria = Convocatoria;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Convocatoria.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Convocatoria.prototype, "number", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Convocatoria.prototype, "year", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Convocatoria.prototype, "directedTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Convocatoria.prototype, "budgetPerProject", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Convocatoria.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Convocatoria.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Convocatoria.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.DynamicFieldSchema], default: [] }),
    __metadata("design:type", Array)
], Convocatoria.prototype, "dynamicFields", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Convocatoria.prototype, "isActive", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose.Schema.Types.ObjectId, ref: 'Rubric' }),
    __metadata("design:type", String)
], Convocatoria.prototype, "rubricId", void 0);
exports.Convocatoria = Convocatoria = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Convocatoria);
exports.ConvocatoriaSchema = mongoose_1.SchemaFactory.createForClass(Convocatoria);
//# sourceMappingURL=convocatoria.schema.js.map