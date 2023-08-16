import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDeviceDTO } from 'src/database/mongodb/dto/create-device.dto';
import {
  Device,
  DeviceDocument,
} from 'src/database/mongodb/models/device.model';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
  ) {}

  /**
   * Create a new device.
   * @param createDeviceDto Data transfer object
   * @returns Promise<DeviceModel>
   */
  async create(createDeviceDto: CreateDeviceDTO): Promise<DeviceDocument> {
    const newDevice = new this.deviceModel(createDeviceDto);
    return newDevice.save();
  }

  /**
   * Find a device by a given device id.
   * @param deviceId Device id
   * @returns Promise<DeviceModel>
   */
  async findById(deviceId): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    return device;
  }

  /**
   * Find an return a device if it is owned by the given user id.
   * Returns `null` if the given user is not the owner of the device.
   * @param deviceId Device id
   * @param userId User id
   * @returns Promise<DeviceModel>
   */
  async findOneForUser(deviceId, userId): Promise<DeviceDocument> {
    const device = await this.deviceModel.findById(deviceId).exec();
    return device.owner === userId ? device : null;
  }

  /**
   * Find all devices.
   * @returns Promise<DeviceModel[]>
   */
  async find(): Promise<Device[]> {
    const devices = await this.deviceModel.find().exec();
    return devices;
  }

  /**
   * Find all devices for a given user id.
   * The returned array will be empty if the user id is not formatted correctly.
   * @param userId User id
   * @returns Promise<DeviceModel[]>
   */
  async findForUser(userId): Promise<DeviceDocument[]> {
    const devices = await this.deviceModel.find().exec();
    const testObjStr = new Types.ObjectId(userId).toString();
    return devices.filter((d) => testObjStr === d.owner.toString());
  }

  /**
   * Find a device by a given IMEI.
   * @param imei IMEI
   * @returns Promise<DeviceModel>
   */
  async findByImei(imei): Promise<DeviceDocument> {
    const device = await this.deviceModel.findOne({ imei }).exec();
    return device;
  }

  /**
   * Update device data by a given DTO.
   * @param deviceId Device id
   * @param createDeviceDto Data transfer object
   * @returns Promise<DeviceModel>
   */
  async updateByDto(
    deviceId,
    createDeviceDto: CreateDeviceDTO,
  ): Promise<DeviceDocument> {
    const editedDevice = await this.deviceModel
      .findByIdAndUpdate(deviceId, createDeviceDto, { new: true })
      .exec();
    return editedDevice;
  }

  /**
   * Update device data by a given device model.
   * @param device Device model
   * @returns Promise<DeviceModel>
   */
  async updateDevice(device: DeviceDocument): Promise<DeviceDocument> {
    const updatedDevice = await this.deviceModel
      .findOneAndUpdate({ _id: device._id }, device, { new: true })
      .exec();
    return updatedDevice;
  }

  /**
   * Update device data by a given IMEI.
   * @param imei IMEI
   * @param createDeviceDto Data transfer object
   * @param keepReferences If model references shall be kept
   * @returns Promise<DeviceModel>
   */
  async updateByImei(
    imei,
    createDeviceDto: CreateDeviceDTO,
    keepReferences = true,
  ): Promise<DeviceDocument> {
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

  /**
   * Delete a device.
   * @param deviceId Device id
   * @returns Promise<any>
   */
  async deleteById(deviceId): Promise<any> {
    // TODO Remove device from all users
    // TODO Make sure all refrenced data is also deleted, e.g. positions, sensor data
    const deletedDevice = await this.deviceModel
      .findByIdAndRemove(deviceId)
      .exec();
    return deletedDevice;
  }
}
