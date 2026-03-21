import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RubricDocument = Rubric & Document;

@Schema()
export class Criterion {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  maxScore: number;
}

@Schema({ timestamps: true })
export class Rubric {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [SchemaFactory.createForClass(Criterion)], default: [] })
  criteria: Criterion[];
}

export const RubricSchema = SchemaFactory.createForClass(Rubric);
