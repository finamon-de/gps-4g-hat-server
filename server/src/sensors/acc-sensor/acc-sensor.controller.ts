import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CreateAccSensorDTO } from 'src/database/mongodb/dto/create-acc-sensor.dto';
import { ValidateObjectId } from 'src/database/mongodb/shared/pipes/validate-object-id.pipes';
import { AccSensorService } from './acc-sensor.service';
import {
  ApiTags,
  ApiOperation,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('acc-sensor')
@Controller('/sensors/acc-sensor')
export class AccSensorController {
  constructor(private accSensorService: AccSensorService) {}

  @ApiOperation({
    summary: 'Add new sensor data.',
    description:
      'Add new sensor data. It is required that the `device` property is set.',
  })
  @ApiOkResponse({ description: 'Success message' })
  @ApiBadRequestResponse({
    description: "The `device` property wasn't set properly.",
  })
  @Post('/')
  async addAccSensorData(
    @Res() res,
    @Body() createAccSensorDto: CreateAccSensorDTO,
  ) {
    if (
      !createAccSensorDto.device ||
      !Types.ObjectId.isValid(
        createAccSensorDto.device as unknown as Types.ObjectId,
      )
    ) {
      throw new BadRequestException('Property `device` is not set.');
    }

    const newAccSensorData = await this.accSensorService.addAccSensorData(
      createAccSensorDto,
    );
    return res.status(HttpStatus.OK).json({
      message: 'Acc. sensor data has been added successfully',
      data: newAccSensorData,
    });
  }

  @ApiOperation({
    summary: 'Get a sensor data record.',
    description: 'Get a sensor data record.',
  })
  @ApiParam({ name: 'accSensorId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: 'Sensor data record was not found or does not exist.',
  })
  @Get('/:accSensorId')
  async getAccSensorDataObject(
    @Res() res,
    @Param('accSensorId', new ValidateObjectId()) accSensorId,
  ) {
    const accSensorDataRecord =
      await this.accSensorService.getAccSensorDataObject(accSensorId);
    if (!accSensorDataRecord) {
      throw new NotFoundException('Acc. sensor data record does not exist');
    }
    return res.status(HttpStatus.OK).json(accSensorDataRecord);
  }

  @ApiOperation({
    summary: 'Get all sensor data for a device.',
    description: 'Get all sensor data for a device.',
  })
  @ApiQuery({ name: 'deviceId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @Get('/')
  async getAccSensorData(
    @Res() res,
    @Query('deviceId', new ValidateObjectId()) deviceId,
  ) {
    const accSensorData = await this.accSensorService.getAccSensorDataForDevice(
      deviceId,
    );
    return res.status(HttpStatus.OK).json(accSensorData);
  }

  @ApiOperation({
    summary: 'Delete a sensor data record.',
    description: 'Delete a sensor data record.',
  })
  @ApiParam({ name: 'accSensorId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: 'Sensor data record was not found or does not exist.',
  })
  @Delete('/:accSensorId')
  async deleteAccSensorDataObject(
    @Res() res,
    @Param('accSensorId', new ValidateObjectId()) accSensorId,
  ) {
    const deletedAccSensorDataRecord =
      await this.accSensorService.deleteAccSensorData(accSensorId);
    if (!deletedAccSensorDataRecord) {
      throw new NotFoundException('Acc. sensor data record does not exist');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Acc. sensor data record dleted successfully',
      data: deletedAccSensorDataRecord,
    });
  }
}
