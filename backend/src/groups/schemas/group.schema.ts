import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  categoria: string;

  @Prop()
  leaderName: string;

  @Prop()
  grupLAC: string;

  @Prop()
  facultad: string;

  @Prop()
  areaConocimiento: string;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
