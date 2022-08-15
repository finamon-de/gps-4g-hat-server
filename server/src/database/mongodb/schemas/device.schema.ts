import * as mongoose from 'mongoose';

export const DeviceSchema = new mongoose.Schema({
  imei: String,
  ip: String,
  inputs: Number,
  outputs: Number,
  led: Number,
  button: Number,
  last_contact: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  positions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Position',
    },
  ],
  acc_sensor_data: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AccSensor',
    },
  ],
});

export const DeviceModel = mongoose.model('Device', DeviceSchema);
