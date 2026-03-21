import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  BORRADOR = 'borrador',
  RADICADO = 'radicado',
  EN_REVISION = 'en_revision',
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado'
}

@Schema({ timestamps: true })
export class ProjectEvaluation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  evaluator: Types.ObjectId;

  @Prop({ default: 'pendiente' })
  status: string; // pendiente, evaluando, finalizado

  @Prop({ type: Object, default: {} })
  scores: Record<string, number>;

  @Prop({ type: Object, default: {} })
  criterionComments: Record<string, string>;

  @Prop()
  comments: string;

  @Prop({ default: 0 })
  totalScore: number;
}
export const ProjectEvaluationSchema = SchemaFactory.createForClass(ProjectEvaluation);

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop()
  summary: string;

  @Prop({ type: Types.ObjectId, ref: 'Convocatoria', required: true })
  convocatoria: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  investigadorPrincipal: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  executionMonths: number;

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Group' }] })
  participatingGroups: Types.ObjectId[];

  @Prop({ 
    type: [{
      user: { type: Types.ObjectId, ref: 'User', required: false },
      name: { type: String, required: false },
      identificationNumber: { type: String, required: false },
      role: { type: String, required: true },
      hoursPerMonth: { type: Number, default: 0 },
      hourlyRate: { type: Number, default: 0 },
      months: { type: Number, default: 0 },
      isContrapartida: { type: Boolean, default: false },
    }], 
    default: [] 
  })
  teamMembers: any[];

  // Stores responses keyed by the dynamicField name e.g. { "presupuesto": "1000", "planteamiento": "..." }
  @Prop({ type: Object, default: {} })
  dynamicResponses: Record<string, any>;

  @Prop({ type: String, enum: Object.values(ProjectStatus), default: ProjectStatus.BORRADOR })
  status: ProjectStatus;

  @Prop()
  resolutionComments: string;

  @Prop({ type: [ProjectEvaluationSchema], default: [] })
  evaluations: ProjectEvaluation[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
