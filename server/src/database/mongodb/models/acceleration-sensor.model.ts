import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as mongooseSchema } from 'mongoose';

@Schema()
export class AccelerationSensor {
  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;

  @Prop({ required: true })
  z: number;

  @Prop({ required: true })
  status: number;

  @Prop({ required: true })
  utc: number;

  @Prop({ type: mongooseSchema.Types.ObjectId, required: true, ref: 'Device' })
  device: string;
}

export type AccelerationSensorDocument = HydratedDocument<AccelerationSensor>;

export const AccelerationSensorSchema =
  SchemaFactory.createForClass(AccelerationSensor);
