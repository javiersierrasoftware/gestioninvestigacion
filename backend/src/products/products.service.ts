import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, ProductStatus } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async create(userId: string, createProductDto: CreateProductDto): Promise<Product> {
    // Validación Anti-Duplicado ("Truco de Oro" Parte 1)
    if (createProductDto.uniqueId) {
      const existing = await this.productModel.findOne({ uniqueId: createProductDto.uniqueId });
      if (existing) {
        throw new ConflictException({
           message: 'ALERTA DE DUPLICIDAD: Ya existe un producto registrado en la universidad con este identificador único (D.O.I, ISBN/ISSN). Si usted es coautor, contacte al docente que lo subió para que lo vincule en su equipo de autores.',
           existingId: existing._id
        });
      }
    }

    // Auto-vincular al creador a la lista de autores si no está (por protección)
    const authors = createProductDto.authors || [];
    if (!authors.some(a => a.user?.toString() === userId)) {
       // Opcional: Se puede forzar que el creador debe estar. A veces lo sube una secretaria, por lo que lo dejamos libre.
    }

    const newProduct = new this.productModel({
      ...createProductDto,
      createdBy: userId,
      status: createProductDto.status || ProductStatus.BORRADOR
    });

    return newProduct.save();
  }

  // Esta función es la "Truco de Oro Parte 2": La magia de la distribución
  async findMyProducts(userId: string): Promise<Product[]> {
    return this.productModel.find({
      $or: [
        { createdBy: userId },
        { 'authors.user': userId }
      ]
    })
    .populate('authors.user', 'name email facultad')
    .sort({ createdAt: -1 })
    .exec();
  }

  async findAll(): Promise<Product[]> {
    return this.productModel.find().populate('authors.user', 'name email facultad group').sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productModel.findById(id).populate('authors.user', 'name email facultad').exec();
    if (!product) throw new NotFoundException('Producto no encontrado');
    return product;
  }

  async update(id: string, userId: string, updateData: any): Promise<Product> {
    const product = await this.productModel.findById(id);
    if (!product) throw new NotFoundException('Producto no encontrado');
    
    // Solo permitir edición a autores o admin
    if (product.createdBy.toString() !== userId && !product.authors.some(a => a.user?.toString() === userId)) {
        throw new ConflictException('No tienes permisos para editar este producto');
    }

    // Si cambian uniqueId, verificar de nuevo duplicidad
    if (updateData.uniqueId && updateData.uniqueId !== product.uniqueId) {
      const existing = await this.productModel.findOne({ uniqueId: updateData.uniqueId });
      if (existing) throw new ConflictException('El identificador único ya está en uso por otro producto.');
    }

    Object.assign(product, updateData);
    return product.save();
  }
}
