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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CiarpController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const ciarp_service_1 = require("./ciarp.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const fs = __importStar(require("fs"));
const uploadDir = './uploads/ciarp';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
let CiarpController = class CiarpController {
    ciarpService;
    constructor(ciarpService) {
        this.ciarpService = ciarpService;
    }
    async createRequest(req, files, body) {
        const userId = req.user.userId;
        const { productId, tipoReconocimiento, puntosSolicitados } = body;
        let descriptions = [];
        try {
            if (body.descriptions) {
                descriptions = JSON.parse(body.descriptions);
            }
        }
        catch (e) { }
        const evidencias = (files || []).map((f, index) => ({
            fileUrl: f.filename,
            originalName: f.originalname,
            description: descriptions[index] || 'Evidencia sin descripción'
        }));
        return this.ciarpService.createRequest(userId, productId, tipoReconocimiento, Number(puntosSolicitados), evidencias);
    }
    getAllRequests() {
        return this.ciarpService.getAllRequests();
    }
    getMyRequests(req) {
        return this.ciarpService.getMyRequests(req.user.userId);
    }
    evaluateRequest(id, body) {
        return this.ciarpService.evaluateRequest(id, body.status, body.comentariosComite);
    }
    downloadEvidence(filename, res) {
        const filePath = `${uploadDir}/${filename}`;
        if (!fs.existsSync(filePath)) {
            throw new common_1.NotFoundException('Archivo de evidencia no encontrado o fue eliminado.');
        }
        return res.sendFile(filename, { root: uploadDir });
    }
};
exports.CiarpController = CiarpController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 3, {
        storage: (0, multer_1.diskStorage)({
            destination: uploadDir,
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, `ciarp-${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype === 'application/pdf')
                cb(null, true);
            else
                cb(new Error('Solo se permiten archivos PDF con formato válido'), false);
        }
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Object]),
    __metadata("design:returntype", Promise)
], CiarpController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CiarpController.prototype, "getAllRequests", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CiarpController.prototype, "getMyRequests", null);
__decorate([
    (0, common_1.Put)('evaluate/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CiarpController.prototype, "evaluateRequest", null);
__decorate([
    (0, common_1.Get)('download/:filename'),
    __param(0, (0, common_1.Param)('filename')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], CiarpController.prototype, "downloadEvidence", null);
exports.CiarpController = CiarpController = __decorate([
    (0, common_1.Controller)('ciarp'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [ciarp_service_1.CiarpService])
], CiarpController);
//# sourceMappingURL=ciarp.controller.js.map