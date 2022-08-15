import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  password: String,
  created: String,
  updated: String,
  devices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
    },
  ],
});
