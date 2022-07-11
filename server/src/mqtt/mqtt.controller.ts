import { Controller, Inject, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccSensorService } from 'src/acc-sensor/acc-sensor.service';
import { DeviceService } from 'src/device/device.service';
import { PositionService } from 'src/position/position.service';
import { WebSocketClient } from 'src/websockets/client';

@Controller('mqtt')
export class MqttController {

    constructor(
        private webSocket: WebSocketClient,
        private deviceService: DeviceService,
        private positionService: PositionService,
        private accSensorService: AccSensorService
    ) {}

    @MessagePattern("device/status")
    async getDeviceStatus(@Payload() data) {
        try {
            if (!data.hasOwnProperty('imei')) {
                console.log("No imei");
                return "error";
            }

            const updatedRecord = await this.deviceService.updateDeviceByImei(data.imei, data);
            return !updatedRecord ? "error" : "success"
        } catch(e) {
            console.log(e)
            return "Could not parse payload. Is it a valid JSON string?"
        }
    }

    @MessagePattern("gps/coordinates")
    async getCoordinate(@Payload() data) {
        try {
            if (!data.hasOwnProperty('imei')) {
                console.log("No imei");
                return "error";
            }
            
            const device = await this.deviceService.getDeviceByImei(data.imei);
            if (!device) {
                throw new NotFoundException(`Device with imei ${data.imei} does not exist`)
            }

            const objToAdd = {
                latitude: data.latitude,
                longitude: data.longitude,
                altitude: data.altitude ?? 0.0,
                utc: data.utc,
                device: device._id
            }

            const addedRecord = await this.positionService.addPosition(objToAdd);

            if (addedRecord && !Array.isArray(device.positions)) {
                device.positions = [addedRecord._id]
            } else if (addedRecord) {
                device.positions.push(addedRecord._id)
            }

            this.deviceService.updateDevice(device);

            if (addedRecord) {
                this.webSocket.socket.emit("positions", addedRecord);
            }

            return !addedRecord ? "error" : "success"
        } catch(e) {
            console.log(e)
            return "Could not parse payload. Is it a valid JSON string?"
        }
    }

    @MessagePattern("sensors/acceleration")
    async getAccelartionSensorData(@Payload() data) {
        try {
            if (!data.hasOwnProperty('imei')) {
                console.log("No imei");
                return "error";
            }

            const device = await this.deviceService.getDeviceByImei(data.imei);
            if (!device) {
                throw new NotFoundException(`Device with imei ${data.imei} does not exist`)
            }

            const objToAdd = {
                x: data.x,
                y: data.y,
                z: data.z,
                status: data.status,
                utc: data.utc,
                device: device._id
            }

            const addedRecord = await this.accSensorService.addAccSensorData(objToAdd);

            if (addedRecord && !Array.isArray(device.positions)) {
                device.positions = [addedRecord._id]
            } else if (addedRecord) {
                device.positions.push(addedRecord._id)
            }

            this.deviceService.updateDevice(device);

            return !addedRecord ? "error" : "success"
        } catch(e) {
            console.log(e)
            return "Could not parse payload. Is it a valid JSON string?"
        }
    }
}
