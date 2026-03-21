import { Controller, Post, Get, Body, Req, Res, UseGuards, Param, Put, UploadedFiles, UseInterceptors, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CiarpService } from './ciarp.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CiarpStatus } from './schemas/ciarp.schema';
import * as fs from 'fs';

// Ensure upload metadata directory exists securely
const uploadDir = './uploads/ciarp';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

@Controller('ciarp')
@UseGuards(JwtAuthGuard)
export class CiarpController {
  constructor(private readonly ciarpService: CiarpService) {}

  @Post('request')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      storage: diskStorage({
        destination: uploadDir,
        filename: (req: any, file: any, cb: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `ciarp-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype === 'application/pdf') cb(null, true);
        else cb(new Error('Solo se permiten archivos PDF con formato válido'), false);
      }
    })
  )
  async createRequest(
    @Req() req: any, 
    @UploadedFiles() files: Array<any>, 
    @Body() body: any
  ) {
    const userId = req.user.userId;
    const { productId, tipoReconocimiento, puntosSolicitados } = body;
    
    // Las descripciones llegan como un string JSONificado desde el frontend
    let descriptions = [];
    try {
      if (body.descriptions) {
        descriptions = JSON.parse(body.descriptions);
      }
    } catch(e) {}

    const evidencias = (files || []).map((f, index) => ({
      fileUrl: f.filename,
      originalName: f.originalname,
      description: descriptions[index] || 'Evidencia sin descripción'
    }));

    return this.ciarpService.createRequest(
      userId, 
      productId, 
      tipoReconocimiento, 
      Number(puntosSolicitados), 
      evidencias
    );
  }

  @Get('all')
  getAllRequests() {
    return this.ciarpService.getAllRequests();
  }

  @Get('my-requests')
  getMyRequests(@Req() req: any) {
    return this.ciarpService.getMyRequests(req.user.userId);
  }

  @Put('evaluate/:id')
  evaluateRequest(@Param('id') id: string, @Body() body: { status: CiarpStatus, comentariosComite: string }) {
    return this.ciarpService.evaluateRequest(id, body.status, body.comentariosComite);
  }

  @Get('download/:filename')
  downloadEvidence(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = `${uploadDir}/${filename}`;
    if (!fs.existsSync(filePath)) {
       throw new NotFoundException('Archivo de evidencia no encontrado o fue eliminado.');
    }
    return res.sendFile(filename, { root: uploadDir });
  }
}
