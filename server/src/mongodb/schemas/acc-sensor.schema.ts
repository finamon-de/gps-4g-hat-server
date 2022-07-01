import * as mongoose from "mongoose";

export const AccSensorSchema = new mongoose.Schema({
    x: Number,
    y: Number,
    z: Number,
    status: Number,
    utc: Number,
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device"
    }
});

export const AccSensorModel = mongoose.model("AccSensor", AccSensorSchema);