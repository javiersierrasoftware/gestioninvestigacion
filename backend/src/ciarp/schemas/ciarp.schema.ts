import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CiarpRequestDocument = CiarpRequest & Document;

export enum CiarpStatus {
  EN_ESTUDIO = 'En Estudio CIARP',
  APROBADO = 'Aprobado',
  RECHAZADO = 'Rechazado',
  REQUIERE_AJUSTES = 'Requiere Ajustes'
}

@Schema({ timestamps: true })
export class CiarpRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  docenteId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true, enum: ['Puntos Salariales', 'Bonificación'] })
  tipoReconocimiento: string;

  @Prop({ required: true, type: Number })
  puntosSolicitados: number;

  @Prop({
    type: [{
      fileUrl: String,
      originalName: String,
      description: String
    }],
    default: []
  })
  evidencias: { fileUrl: string, originalName: string, description: string }[];

  @Prop({ required: true, default: CiarpStatus.EN_ESTUDIO, enum: Object.values(CiarpStatus) })
  status: CiarpStatus;

  @Prop()
  comentariosComite?: string;
}

export const CiarpRequestSchema = SchemaFactory.createForClass(CiarpRequest);
