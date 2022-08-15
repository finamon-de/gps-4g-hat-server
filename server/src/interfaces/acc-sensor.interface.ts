import { Document, Schema } from 'mongoose';

export interface AccSensor extends Document {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly status: number;
  readonly utc: number;
  readonly device: Schema.Types.ObjectId | Record<string, unknown>;
}
