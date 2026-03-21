import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  DOCENTE = 'docente',
  COMITE = 'comite',
  DIVISION_INVESTIGACION = 'division_investigacion',
  EVALUADOR = 'evaluador',
  CIARP = 'ciarp',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.DOCENTE })
  role: UserRole;

  @Prop()
  facultad?: string;

  @Prop()
  programa?: string;

  @Prop()
  areaConocimiento?: string;

  @Prop({ unique: true, sparse: true })
  identificationNumber?: string;

  @Prop()
  phone?: string;

  @Prop()
  mincienciasCategory?: string;

  @Prop()
  researchAreas?: string;

  @Prop()
  biography?: string;

  @Prop()
  birthDate?: string;

  @Prop()
  mesVinculacion?: string;

  @Prop()
  anoVinculacion?: string;

  @Prop()
  tipoContrato?: string;

  @Prop()
  cvlacUrl?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  grupos: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
