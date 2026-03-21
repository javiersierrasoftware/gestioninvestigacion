import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ProductionType {
  ARTICULO = 'articulo',
  LIBRO = 'libro',
  CAPITULO = 'capitulo',
  PATENTE = 'patente',
  SOFTWARE = 'software',
  OTRO = 'otro'
}

export enum ValidationStatus {
  PENDIENTE = 'pendiente',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado'
}

@Schema({ timestamps: true })
export class Production {
  @Prop({ required: true })
  title: string;

  @Prop({ type: String, enum: ProductionType, required: true })
  type: ProductionType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  docente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  grupo?: Types.ObjectId;

  @Prop()
  revistaOEditorial?: string;

  @Prop()
  fechaPublicacion?: Date;

  @Prop()
  identificador?: string; // DOI, ISBN, etc.

  @Prop({ type: [String] })
  evidencias: string[];

  @Prop({ type: String, enum: ValidationStatus, default: ValidationStatus.PENDIENTE })
  status: ValidationStatus;

  @Prop({ default: 0 })
  puntosSalarialesAsignados: number;

  @Prop({ default: 0 })
  bonificacionAsignada: number;

  @Prop()
  comentariosComite?: string;
}

export const ProductionSchema = SchemaFactory.createForClass(Production);
