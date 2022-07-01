import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Query, Res } from '@nestjs/common';
import { CreateAccSensorDTO } from 'src/mongodb/dto/create-acc-sensor.dto';
import { ValidateObjectId } from 'src/mongodb/shared/pipes/validate-object-id.pipes';
import { AccSensorService } from './acc-sensor.service';

@Controller('/sensors/acc-sensor')
export class AccSensorController {
    constructor(private accSensorService: AccSensorService) {}

    @Post("/")
    async addAccSensorData(
        @Res() res,
        @Body() createAccSensorDto: CreateAccSensorDTO
    ) {
        const newAccSensorData = await this.accSensorService.addAccSensorData(createAccSensorDto);
        return res.status(HttpStatus.OK).json({
            message: "Acc. sensor data has been added successfully",
            data: newAccSensorData
        })
    }

    @Get("/:accSensorId")
    async getAccSensorDataObject(
        @Res() res,
        @Param("accSensorId", new ValidateObjectId()) accSensorId
    ) {
        const accSensorDataRecord = await this.accSensorService.getAccSensorDataObject(accSensorId);
        if (!accSensorDataRecord) {
            throw new NotFoundException("Acc. sensor data record does not exist");
        }
        return res.status(HttpStatus.OK).json(accSensorDataRecord)
    }

    @Get("/")
    async getAccSensorData(
        @Res() res,
        @Query("deviceId", new ValidateObjectId()) deviceId
    ) {
        const accSensorData = await this.accSensorService.getAccSensorDataForDevice(deviceId);
        return res.status(HttpStatus.OK).json(accSensorData);
    }

    @Delete("/delete")
    async deleteAccSensorDataObject(
        @Res() res,
        @Query("accSensorId", new ValidateObjectId()) accSensorId
    ) {
        const deletedAccSensorDataRecord = await this.accSensorService.deleteAccSensorData(accSensorId);
        if (!deletedAccSensorDataRecord) {
            throw new NotFoundException("Acc. sensor data record does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "Acc. sensor data record dleted successfully",
            data: deletedAccSensorDataRecord
        })
    }
}
