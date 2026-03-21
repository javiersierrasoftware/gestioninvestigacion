import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

export type ConvocatoriaDocument = Convocatoria & Document;

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  FILE = 'file',
  DATE = 'date',
  TABLE = 'table'
}

@Schema()
export class DynamicField {
  @Prop({ required: true })
  name: string; // Identifier for the field

  @Prop({ required: true })
  label: string; // User friendly prompt/label

  @Prop({ required: true, default: '' })
  helpText: string; // Instructions for the docente

  @Prop({ default: '' })
  placeholder: string; // Input placeholder

  @Prop({ type: String, enum: FieldType, required: true })
  type: FieldType;

  @Prop({ default: false })
  required: boolean;

  @Prop({ type: [String], default: [] })
  options: string[]; // For SELECT type

  @Prop({ type: [String], default: [] })
  columns: string[]; // For TABLE type
}
export const DynamicFieldSchema = SchemaFactory.createForClass(DynamicField);

@Schema({ timestamps: true })
export class Convocatoria {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  number: string; // Número de la convocatoria (ej: 001-2026)

  @Prop({ required: true })
  year: number; // Año de apertura

  @Prop({ required: true })
  directedTo: string; // A quien va dirigida

  @Prop({ required: true })
  budgetPerProject: number; // Valor por proyecto a financiar

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ type: [DynamicFieldSchema], default: [] })
  dynamicFields: DynamicField[]; // Configuration array for docentes forms
  
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Rubric' })
  rubricId: string;
}

export const ConvocatoriaSchema = SchemaFactory.createForClass(Convocatoria);
