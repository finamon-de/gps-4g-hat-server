import { Schema } from 'mongoose';

export class CreatePositionDTO {
  readonly latitude: number;
  readonly longitude: number;
  readonly altitude: number;
  readonly utc: number;
  readonly device: Schema.Types.ObjectId | unknown;
}
