import { Document, Schema } from "mongoose";

export interface Device extends Document {
    readonly imei: string,
    readonly ip: string,
    readonly inputs: number,
    readonly outputs: number,
    readonly led: number,
    readonly button: number,
    readonly last_contact: string,
    readonly owner: Schema.Types.ObjectId | Record<string, unknown>,
    readonly positions: Schema.Types.ObjectId | Record<string, unknown>,
    readonly acc_sensor_data: Schema.Types.ObjectId | Record<string, unknown>
}