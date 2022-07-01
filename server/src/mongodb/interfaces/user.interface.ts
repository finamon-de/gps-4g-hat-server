import { Document, Schema } from "mongoose";

export interface User extends Document {
    readonly firstname: string,
    readonly lastname: string,
    readonly email: string,
    readonly password: string,
    readonly created: string,
    readonly updated: string,
    readonly devices: Schema.Types.ObjectId | Record<string, unknown>
}