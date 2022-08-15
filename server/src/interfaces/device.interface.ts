import { Document, Schema } from 'mongoose';

export interface Device extends Document {
  readonly imei: string;
  readonly ip: string;
  readonly inputs: number;
  readonly outputs: number;
  readonly led: number;
  readonly button: number;
  readonly last_contact: string;
  owner: Schema.Types.ObjectId | Record<string, unknown>;
  positions: Array<Schema.Types.ObjectId> | Array<Record<string, unknown>>;
  acc_sensor_data:
    | Array<Schema.Types.ObjectId>
    | Array<Record<string, unknown>>;
}
