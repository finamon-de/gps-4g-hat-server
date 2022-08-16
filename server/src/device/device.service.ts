import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDeviceDTO } from 'src/database/mongodb/dto/create-device.dto';
import { Device } from 'src/database/mongodb/interfaces/device.interface';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
  ) {}

  async addDevice(createDeviceDto: CreateDeviceDTO): Promise<Device> {
    const newDevice = new this.deviceModel(createDeviceDto);
    return newDevice.save();
  }

  async getDevice(deviceId): Promise<Device> {
    const device = await this.deviceModel.findById(deviceId).exec();
    return device;
  }

  async getDeviceForUser(deviceId, userId): Promise<Device> {
    const device = await this.deviceModel.findById(deviceId).exec();
    return device.owner === userId ? device : null;
  }

  async getDevices(): Promise<Device[]> {
    const devices = await this.deviceModel.find().exec();
    return devices;
  }

  async getDevicesForUser(userId): Promise<Device[]> {
    const devices = await this.deviceModel.find().exec();
    const testObjStr = new Types.ObjectId(userId).toString();
    return devices.filter((d) => testObjStr === d.owner.toString());
  }

  async getDeviceByImei(imei): Promise<Device> {
    const device = await this.deviceModel.findOne({ imei }).exec();
    return device;
  }

  async editDevice(
    deviceId,
    createDeviceDto: CreateDeviceDTO,
  ): Promise<Device> {
    const editedDevice = await this.deviceModel
      .findByIdAndUpdate(deviceId, createDeviceDto, { new: true })
      .exec();
    return editedDevice;
  }

  async updateDevice(device: Device): Promise<Device> {
    const updatedDevice = await this.deviceModel
      .findOneAndUpdate({ _id: device._id }, device, { new: true })
      .exec();
    return updatedDevice;
  }

  async updateDeviceByImei(
    imei,
    createDeviceDto: CreateDeviceDTO,
    keepReferences = true,
  ): Promise<Device> {
    let updatedDevice;
    try {
      if (!keepReferences) {
        updatedDevice = await this.deviceModel
          .findOneAndUpdate({ imei }, createDeviceDto, { new: true })
          .exec();
      } else {
        const objToUpdate = {
          imei: createDeviceDto.imei,
          ip: createDeviceDto.ip,
          inputs: createDeviceDto.inputs,
          outputs: createDeviceDto.outputs,
          led: createDeviceDto.led,
          button: createDeviceDto.button,
          last_contact: new Date().toISOString(),
        };
        updatedDevice = await this.deviceModel
          .findOneAndUpdate({ imei }, { ...objToUpdate }, { new: true })
          .exec();
      }
    } catch (e) {
      console.error(e);
    }

    return updatedDevice;
  }

  async deleteDevice(deviceId): Promise<any> {
    const deletedDevice = await this.deviceModel
      .findByIdAndRemove(deviceId)
      .exec();
    return deletedDevice;
  }
}
