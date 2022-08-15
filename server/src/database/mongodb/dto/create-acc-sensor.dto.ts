import { Schema } from 'mongoose';

export class CreateAccSensorDTO {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly status: number;
  readonly utc: number;
  readonly device: Schema.Types.ObjectId | Record<string, unknown>;
}
