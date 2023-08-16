import { Schema } from 'mongoose';

export class CreateDeviceDTO {
  readonly imei: string;
  readonly ip: string;
  readonly inputs: number;
  readonly outputs: number;
  readonly led: number;
  readonly button: number;
  readonly last_contact: string;
  readonly owner: Schema.Types.ObjectId | unknown;
  readonly positions: Schema.Types.ObjectId | unknown;
  readonly acc_sensor_data: Schema.Types.ObjectId | unknown;
}
