import { Document, Schema } from 'mongoose';

export interface Position extends Document {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude: number;
  readonly utc: number;
  readonly device: Schema.Types.ObjectId | Record<string, unknown>;
}
