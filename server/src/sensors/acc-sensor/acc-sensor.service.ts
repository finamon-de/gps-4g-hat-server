import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateAccSensorDTO } from 'src/database/mongodb/dto/create-acc-sensor.dto';
import { AccSensor } from 'src/interfaces/acc-sensor.interface';

@Injectable()
export class AccSensorService {
  constructor(
    @InjectModel('AccSensor') private readonly accSensorModel: Model<AccSensor>,
  ) {}

  async addAccSensorData(
    createAccSensorDto: CreateAccSensorDTO,
  ): Promise<AccSensor> {
    const newAccData = new this.accSensorModel(createAccSensorDto);
    return newAccData.save();
  }

  async getAccSensorDataObject(accSenosrId): Promise<AccSensor> {
    const accSensorDataObject = await this.accSensorModel
      .findById(accSenosrId)
      .exec();
    return accSensorDataObject;
  }

  async getAccSensorData(): Promise<AccSensor[]> {
    const accSensorData = await this.accSensorModel.find().exec();
    return accSensorData;
  }

  async getAccSensorDataForDevice(deviceId): Promise<AccSensor[]> {
    const accSensorData = await this.getAccSensorData();
    const testObjStr = new Types.ObjectId(deviceId).toString();
    return accSensorData.filter((d) => testObjStr === d.device.toString());
  }

  async deleteAccSensorData(accSenosrId): Promise<AccSensor> {
    const deletedAccSensorData = await this.accSensorModel
      .findOneAndRemove(accSenosrId)
      .exec();
    return deletedAccSensorData;
  }
}
