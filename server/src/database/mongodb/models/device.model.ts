import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as mongooseSchema, HydratedDocument, Types } from 'mongoose';

@Schema()
export class Device {
  @Prop({ required: true })
  imei: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  inputs: number;

  @Prop({ required: true })
  outputs: number;

  @Prop({ required: true })
  led: number;

  @Prop({ required: true })
  button: number;

  @Prop({ required: true })
  last_contact: string;

  @Prop({ type: mongooseSchema.Types.ObjectId, required: true, ref: 'User' })
  owner: Types.ObjectId | unknown;

  @Prop({ type: [{ type: mongooseSchema.Types.ObjectId, ref: 'Position' }] })
  positions: Array<Types.ObjectId> | Array<unknown>;

  @Prop({
    type: [{ type: mongooseSchema.Types.ObjectId, ref: 'AccelerationSensor' }],
  })
  acc_sensor_data: Array<Types.ObjectId> | Array<unknown>;
}

export type DeviceDocument = HydratedDocument<Device>;

export const DeviceSchema = SchemaFactory.createForClass(Device);
