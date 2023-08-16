import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAccSensorDTO } from 'src/database/mongodb/dto/create-acc-sensor.dto';
import {
  AccelerationSensor,
  AccelerationSensorDocument,
} from 'src/database/mongodb/models/acceleration-sensor.model';

@Injectable()
export class AccSensorService {
  constructor(
    @InjectModel('AccelerationSensor')
    private readonly accSensorModel: Model<AccelerationSensor>,
  ) {}

  async addAccSensorData(
    createAccSensorDto: CreateAccSensorDTO,
  ): Promise<AccelerationSensorDocument> {
    const newAccData = new this.accSensorModel(createAccSensorDto);
    return newAccData.save();
  }

  async getAccSensorDataObject(
    accSenosrId,
  ): Promise<AccelerationSensorDocument> {
    const accSensorDataObject = await this.accSensorModel
      .findById(accSenosrId)
      .exec();
    return accSensorDataObject;
  }

  async getAccSensorData(): Promise<AccelerationSensorDocument[]> {
    const accSensorData = await this.accSensorModel.find().exec();
    return accSensorData;
  }

  async getAccSensorDataForDevice(
    deviceId,
  ): Promise<AccelerationSensorDocument[]> {
    const accSensorData = await this.getAccSensorData();
    const testObjStr = new Types.ObjectId(deviceId).toString();
    return accSensorData.filter((d) => testObjStr === d.device.toString());
  }

  async deleteAccSensorData(accSenosrId): Promise<AccelerationSensorDocument> {
    const deletedAccSensorData = await this.accSensorModel
      .findOneAndRemove(accSenosrId)
      .exec();
    return deletedAccSensorData;
  }
}
