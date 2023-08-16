import { Controller, Inject, NotFoundException } from '@nestjs/common';
import {
  ClientProxy,
  Ctx,
  MessagePattern,
  MqttContext,
  Payload,
} from '@nestjs/microservices';
import { AccSensorService } from 'src/modules/sensors/acc-sensor/acc-sensor.service';
import { DeviceService } from 'src/modules/device/device.service';
import { PositionService } from 'src/modules/position/position.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreatePositionDTO } from 'src/database/mongodb/dto/create-position.dto';
import { CreateAccSensorDTO } from 'src/database/mongodb/dto/create-acc-sensor.dto';
import { DeviceDocument } from 'src/database/mongodb/models/device.model';

export interface MqttResponse {
  topic: string;
  response: any;
}

@Controller('mqtt')
export class MqttController {
  private responseTopicPrefix = 'receive/';

  constructor(
    @Inject('MQTT_CLIENT') private mqttClient: ClientProxy,
    private emitter: EventEmitter2,
    private deviceService: DeviceService,
    private positionService: PositionService,
    private accSensorService: AccSensorService,
  ) {}

  /**
   * Update a devices' status.
   * @param data Payload
   * @param context MqttContext
   */
  @MessagePattern('device/status/+')
  async updateDeviceStatus(@Payload() data, @Ctx() context: MqttContext) {
    const topic = context.getTopic();

    try {
      // check if the received message is our own response
      if (this.isResponse(data)) return;

      // check if message is valid
      const result = this.validateMessage(data);
      if (result) {
        this.sendMqttResponse(topic, result);
        return;
      }

      // update device data
      const updatedRecord = await this.deviceService.updateByImei(
        data.imei,
        data,
      );

      // publish response
      this.sendMqttResponse(topic, !updatedRecord ? 'error' : 'success');
    } catch (e) {
      console.log(data, e);
      this.sendMqttResponse(topic, 'error');
    }
  }

  /**
   * Add new coordinates for a device.
   * @param data Payload
   * @param context MqttContext
   */
  @MessagePattern('gps/coordinates/+')
  async updateCoordinates(@Payload() data, @Ctx() context: MqttContext) {
    const topic = context.getTopic();

    try {
      // check if the received message is our own response
      if (this.isResponse(data)) return;

      // check if message is valid
      const result = this.validateMessage(data);
      if (result) {
        this.sendMqttResponse(topic, result);
        return;
      }

      const device = await this.deviceService.findByImei(data.imei);
      if (!device) {
        throw new NotFoundException(
          `Device with imei ${data.imei} does not exist`,
        );
      }

      const objToAdd = this.createDbPositionObj(data, device);
      const addedRecord = await this.positionService.create(objToAdd);

      if (addedRecord && !Array.isArray(device.positions)) {
        device.positions = [addedRecord._id];
      } else if (addedRecord) {
        device.positions.push(addedRecord._id);
      }

      await this.deviceService.updateDevice(device);

      if (addedRecord) {
        this.emitter.emit('ws.position', {
          userId: device.owner.toString(),
          record: addedRecord,
        });
      }

      // publish response
      this.sendMqttResponse(topic, !addedRecord ? 'error' : 'success');
    } catch (e) {
      console.log(data, e);
      this.sendMqttResponse(topic, 'error');
    }
  }

  /**
   * Update acceleration sensor data for a given device.
   * The success response is returned within the corresponding topic.
   * @param data Payload
   * @param context MqttContext
   */
  @MessagePattern('sensors/acceleration/+')
  async updateAccelerationSensorData(
    @Payload() data,
    @Ctx() context: MqttContext,
  ) {
    const topic = context.getTopic();

    try {
      // check if the received message is our own response
      if (this.isResponse(data)) return;

      // check if message is valid
      const result = this.validateMessage(data);
      if (result) {
        this.sendMqttResponse(topic, result);
        return;
      }

      const device = await this.deviceService.findByImei(data.imei);
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
        device.acc_sensor_data = [addedRecord._id];
      } else if (addedRecord) {
        device.acc_sensor_data.push(addedRecord._id);
      }

      await this.deviceService.updateDevice(device);

      // publish response
      this.sendMqttResponse(topic, !addedRecord ? 'error' : 'success');
    } catch (e) {
      console.log(data, e);
      this.sendMqttResponse(topic, 'error');
    }
  }

  /**
   * Check if the payload contains the `response` property.
   * The message containing the `response` property is sent by us
   * when we send a response. This check allows for a quick exit.
   * @param data Payload
   * @returns boolean
   */
  isResponse(data: any): boolean {
    return data.hasOwnProperty('response');
  }

  /**
   * Check if the payload contains the `imei` property.
   * @param data Payload
   * @returns boolean
   */
  hasImei(data: any): boolean {
    return data.hasOwnProperty('imei');
  }

  /**
   * Validate a received message.
   * @param data Payload
   * @returns string Error message if any
   */
  validateMessage(data): string {
    if (!this.hasImei(data)) {
      console.log('No imei');
      return 'missing_imei';
    }
    return '';
  }

  /**
   * Prepare a position object for a database update.
   * @param data Payload
   * @param device Device Model
   * @returns IPosition
   */
  createDbPositionObj(data: any, device: DeviceDocument): CreatePositionDTO {
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      altitude: data.altitude ?? 0.0,
      utc: data.utc,
      device: device._id,
    };
  }

  /**
   * Prepare an acceleration sensor object for a database update.
   * @param data Payload
   * @param device Device model
   * @returns IAccelerationSensor
   */
  createDbAccelerationSensorObj(
    data: any,
    device: DeviceDocument,
  ): CreateAccSensorDTO {
    return {
      x: data.x,
      y: data.y,
      z: data.z,
      status: data.status,
      utc: data.utc,
      device: device._id,
    };
  }

  /**
   * Create the response object.
   * @param currentTopic Current topic
   * @param data Payload
   * @returns MqttResponse
   */
  createResponse(currentTopic: string, data: any): MqttResponse {
    return {
      topic: currentTopic,
      response: data,
    };
  }

  /**
   * Send a message to the response topic.
   * @param currentTopic Current topic
   * @param data Payload
   */
  sendMqttResponse(currentTopic: string, data: any) {
    const parts = currentTopic.split('/');
    const imei = parts[parts.length - 1];
    const responseTopic = `${this.responseTopicPrefix}${imei}`;

    try {
      this.mqttClient.emit(
        responseTopic,
        this.createResponse(currentTopic, data),
      );
    } catch (e) {
      console.error(e);
    }
  }
}
