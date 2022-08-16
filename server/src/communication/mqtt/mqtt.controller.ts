import { Controller, Inject, NotFoundException } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { AccSensorService } from 'src/sensors/acc-sensor/acc-sensor.service';
import { DeviceService } from 'src/device/device.service';
import { PositionService } from 'src/position/position.service';
import { WebSocketClient } from 'src/communication/websockets/client';
import { Device } from '../../database/mongodb/interfaces/device.interface';

@Controller('mqtt')
export class MqttController {
  constructor(
    @Inject('MQTT_CLIENT') private mqttClient: ClientProxy,
    private webSocket: WebSocketClient,
    private deviceService: DeviceService,
    private positionService: PositionService,
    private accSensorService: AccSensorService,
  ) {}

  @MessagePattern('device/status/+')
  async getDeviceStatus(@Payload() data, @Ctx() context: MqttContext) {
    const topic = context.getTopic();

    try {
      // check if the received message is our own response
      if (data.hasOwnProperty('response')) return;

      if (!data.hasOwnProperty('imei')) {
        console.log('No imei');
        this.sendMqttResponse(topic, 'missing_imei');
        return 'missing_imei';
      }

      const updatedRecord = await this.deviceService.updateDeviceByImei(
        data.imei,
        data,
      );

      // publish response
      this.sendMqttResponse(topic, !updatedRecord ? 'error' : 'success');

      return !updatedRecord ? 'error' : 'success';
    } catch (e) {
      console.log(e);
      return 'Could not parse payload. Is it a valid JSON string?';
    }
  }

  @MessagePattern('gps/coordinates/+')
  async getCoordinate(@Payload() data, @Ctx() context: MqttContext) {
    const topic = context.getTopic();

    try {
      // check if the received message is our own response
      if (data.hasOwnProperty('response')) return;

      if (!data.hasOwnProperty('imei')) {
        console.log('No imei');
        this.sendMqttResponse(topic, 'missing_imei');
        return 'missing_imei';
      }

      const device = await this.deviceService.getDeviceByImei(data.imei);
      if (!device) {
        throw new NotFoundException(
          `Device with imei ${data.imei} does not exist`,
        );
      }

      const objToAdd = this.createDbPositionObj(data, device);
      const addedRecord = await this.positionService.addPosition(objToAdd);

      if (addedRecord && !Array.isArray(device.positions)) {
        device.positions = [addedRecord._id];
      } else if (addedRecord) {
        device.positions.push(addedRecord._id);
      }

      await this.deviceService.updateDevice(device);

      if (addedRecord) {
        this.webSocket.socket.emit('positions', addedRecord);
      }

      // publish response
      this.sendMqttResponse(topic, !addedRecord ? 'error' : 'success');

      return !addedRecord ? 'error' : 'success';
    } catch (e) {
      console.log(e);
      return 'Could not parse payload. Is it a valid JSON string?';
    }
  }

  @MessagePattern('sensors/acceleration/+')
  async getAccelerationSensorData(
    @Payload() data,
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();

    try {
      // check if the received message is our own response
      if (data.hasOwnProperty('response')) return;

      if (!data.hasOwnProperty('imei')) {
        console.log('No imei');
        this.sendMqttResponse(topic, 'missing_imei');
        return 'missing_imei';
      }

      const device = await this.deviceService.getDeviceByImei(data.imei);
      if (!device) {
        throw new NotFoundException(
          `Device with imei ${data.imei} does not exist`,
        );
      }

      const objToAdd = this.createDbAccelerationSensorObj(data, device);
      const addedRecord = await this.accSensorService.addAccSensorData(
        objToAdd,
      );

      if (addedRecord && !Array.isArray(device.positions)) {
        device.positions = [addedRecord._id];
      } else if (addedRecord) {
        device.positions.push(addedRecord._id);
      }

      await this.deviceService.updateDevice(device);

      // publish response
      this.sendMqttResponse(topic, !addedRecord ? 'error' : 'success');

      return !addedRecord ? 'error' : 'success';
    } catch (e) {
      console.log(e);
      return 'Could not parse payload. Is it a valid JSON string?';
    }
  }

  createDbPositionObj(data: any, device: Device) {
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude ?? 0.0,
      utc: data.utc,
      device: device._id,
    };
  }

  createDbAccelerationSensorObj(data: any, device: Device) {
    return {
      x: data.x,
      y: data.y,
      z: data.z,
      status: data.status,
      utc: data.utc,
      device: device._id,
    };
  }

  createResponse(data: any) {
    return {
      response: data,
    };
  }

  sendMqttResponse(topic: string, data: any) {
    this.mqttClient.emit(topic, this.createResponse(data));
  }
}