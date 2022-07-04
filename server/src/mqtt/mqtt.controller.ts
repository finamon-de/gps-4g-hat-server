import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AccSensorService } from 'src/acc-sensor/acc-sensor.service';
import { DeviceService } from 'src/device/device.service';
import { PositionService } from 'src/position/position.service';

@Controller('mqtt')
export class MqttController {

    constructor(
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

            const updatedRecord = await this.accSensorService.addAccSensorData(objToAdd);
            return !updatedRecord ? "error" : "success"
        } catch(e) {
            console.log(e)
            return "Could not parse payload. Is it a valid JSON string?"
        }
    }
}
