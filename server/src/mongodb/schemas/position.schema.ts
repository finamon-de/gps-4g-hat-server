import * as mongoose from "mongoose";

export const PositionSchema = new mongoose.Schema({
    latitude: Number,
    longitude: Number,
    altitude: Number,
    utc: Number,
    device: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device"
    }
});

export const PositionModel = mongoose.model("Position", PositionSchema);