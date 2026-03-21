import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CiarpRequest, CiarpRequestDocument, CiarpStatus } from './schemas/ciarp.schema';
import { Product, ProductDocument, ProductStatus } from '../products/schemas/product.schema';

@Injectable()
export class CiarpService {
  constructor(
    @InjectModel(CiarpRequest.name) private ciarpModel: Model<CiarpRequestDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  async createRequest(
    docenteId: string, 
    productId: string, 
    tipoReconocimiento: string, 
    puntosSolicitados: number, 
    evidencias: { fileUrl: string, originalName: string, description: string }[]
  ) {
    const product = await this.productModel.findById(productId);
    if (!product) throw new NotFoundException('Producto no encontrado');

    const newRequest = new this.ciarpModel({
      docenteId: new Types.ObjectId(docenteId),
      productId: new Types.ObjectId(productId),
      tipoReconocimiento,
      puntosSolicitados,
      evidencias
    });

    const savedRequest = await newRequest.save();

    // Actualizar el estado del producto
    product.status = ProductStatus.EVALUACION_CIARP;
    await product.save();

    return savedRequest;
  }

  async getAllRequests() {
    return this.ciarpModel.find()
      .populate('docenteId', 'name email')
      .populate('productId', 'title type category uniqueId status')
      .sort({ createdAt: -1 });
  }

  async getMyRequests(docenteId: string) {
    return this.ciarpModel.find({ docenteId: new Types.ObjectId(docenteId) })
      .populate('productId', 'title type status metadata')
      .sort({ createdAt: -1 });
  }

  async evaluateRequest(requestId: string, status: CiarpStatus, comentariosComite: string) {
    const request = await this.ciarpModel.findById(requestId);
    if (!request) throw new NotFoundException('Solicitud no encontrada');

    request.status = status;
    request.comentariosComite = comentariosComite;
    await request.save();

    const product = await this.productModel.findById(request.productId);
    if (product) {
       if (status === CiarpStatus.APROBADO) product.status = ProductStatus.APROBADO_CIARP;
       else if (status === CiarpStatus.RECHAZADO) product.status = ProductStatus.RECHAZADO_CIARP;
       else product.status = ProductStatus.RADICADO; // Regresa al estado base si requiere ajustes mayores
       await product.save();
    }

    return request;
  }
}
