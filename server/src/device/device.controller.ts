import { Body, Controller, Delete, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Put, Query, Res } from '@nestjs/common';
import { CreateDeviceDTO } from 'src/mongodb/dto/create-device.dto';
import { ValidateObjectId } from 'src/mongodb/shared/pipes/validate-object-id.pipes';
import { DeviceService } from './device.service';

@Controller('/devices')
export class DeviceController {
    constructor(private deviceService: DeviceService) {}

    @Post("/")
    async addDevice(
        @Res() res, 
        @Body() createDeviceDto: CreateDeviceDTO
    ) {
        const newDevice = await this.deviceService.addDevice(createDeviceDto);
        return res.status(HttpStatus.OK).json({
            message: "Device has been created successfully",
            device: newDevice
        });
    }

    @Get("/:deviceId")
    async getDevice(
        @Res() res, 
        @Param("deviceId", new ValidateObjectId()) deviceId, 
        @Query("userId", new ValidateObjectId()) userId
    ) {
        const device = await this.deviceService.getDeviceForUser(deviceId, userId);
        if (!device) {
            throw new NotFoundException("Device does not exist");
        }
        return res.status(HttpStatus.OK).json(device);
    }

    @Get("/")
    async getDevices(
        @Res() res, 
        @Query("userId", new ValidateObjectId()) userId
    ) {
        const devices = await this.deviceService.getDevicesForUser(userId);
        return res.status(HttpStatus.OK).json(devices);
    }

    @Put("/edit")
    async editDevice(@Res() res, @Query("deviceId", new ValidateObjectId()) deviceId, @Body() createDeviceDto: CreateDeviceDTO) {
        const editedDevice = await this.deviceService.editDevice(deviceId, createDeviceDto)
        if (!editedDevice) {
            throw new NotFoundException("Device does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "Device has been successfully updated", 
            device: editedDevice
        });
    }

    @Delete("/delete")
    async deleteDevice(@Res() res, @Query("deviceId", new ValidateObjectId()) deviceId) {
        const deletedDevice = await this.deviceService.deleteDevice(deviceId);
        if (!deletedDevice) {
            throw new NotFoundException("Device does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "Device has been deleted successfully",
            device: deletedDevice
        })
    }
}
