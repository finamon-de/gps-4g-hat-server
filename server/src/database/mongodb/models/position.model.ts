import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, HydratedDocument } from 'mongoose';

@Schema()
export class Position {
  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  altitude: number;

  @Prop({ required: true })
  utc: number;

  @Prop({ type: mongooseSchema.Types.ObjectId, required: true, ref: 'Device' })
  device: string;
}

export type PositionDocument = HydratedDocument<Position>;

export const PositionSchema = SchemaFactory.createForClass(Position);
