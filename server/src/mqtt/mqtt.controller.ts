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
            const obj = JSON.parse(data)
            const updatedRecord = await this.deviceService.updateDeviceByImei(obj.imei, obj);
            return !updatedRecord ? "error" : "success"
        } catch(e) {
            console.log(e)
            return "Could not parse payload. Is it a valid JSON string?"
        }
    }

    @MessagePattern("gps/coordinates")
    async getCoordinate(@Payload() data) {
        try {
            const obj = JSON.parse(data)
            
            const device = await this.deviceService.getDeviceByImei(obj.imei);
            if (!device) {
                throw new NotFoundException(`Device with imei ${obj.imei} does not exist`)
            }

            const objToAdd = {
                latitude: obj.latitude,
                longitude: obj.longitude,
                altitude: obj.utc ?? null,
                utc: obj.utc,
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
            const obj = JSON.parse(data)

            const device = await this.deviceService.getDeviceByImei(obj.imei);
            if (!device) {
                throw new NotFoundException(`Device with imei ${obj.imei} does not exist`)
            }

            const objToAdd = {
                x: obj.x,
                y: obj.y,
                z: obj.z,
                status: obj.status,
                utc: obj.utc,
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
