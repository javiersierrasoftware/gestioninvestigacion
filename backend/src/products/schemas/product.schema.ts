import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductCategory {
  ACADEMICO = 'académico',
  INVESTIGACION = 'investigación',
}

export enum ProductStatus {
  BORRADOR = 'borrador', // Solo visible para autores, incompleto
  RADICADO = 'radicado', // En firme, listo para el kardex universitario
  EVALUACION_CIARP = 'evaluación_ciarp',
  APROBADO_CIARP = 'aprobado_ciarp',
  RECHAZADO_CIARP = 'rechazado_ciarp',
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, enum: Object.values(ProductCategory) })
  category: ProductCategory;

  @Prop({ required: true })
  type: string; // Artículo, Libro, Capítulo, Software, etc.

  // Lista de coautores (Usuarios internos + Externos)
  @Prop({ type: [{ user: { type: Types.ObjectId, ref: 'User' }, name: String, isExternal: Boolean }], default: [] })
  authors: { user?: Types.ObjectId; name: string; isExternal: boolean }[];

  // Identificador único (DOI, ISBN, ISSN, Registro Nacional...) Evita doble registro.
  @Prop({ unique: true, sparse: true })
  uniqueId?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>; // Fecha publi, revista, editorial, volumen.

  @Prop({ type: String, enum: Object.values(ProductStatus), default: ProductStatus.BORRADOR })
  status: ProductStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
