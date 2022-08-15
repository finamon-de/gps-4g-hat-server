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
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateDeviceDTO } from 'src/database/mongodb/dto/create-device.dto';
import { ValidateObjectId } from 'src/database/mongodb/shared/pipes/validate-object-id.pipes';
import { DeviceService } from './device.service';
import {
  ApiTags,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('device')
@Controller('/devices')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  @ApiOperation({
    summary: 'Create a new device',
    description:
      'Create a new device. It is required that the `owner` property is set.',
  })
  @ApiOkResponse({ description: 'Success message' })
  @ApiBadRequestResponse({
    description:
      'Returned when trying to create a new device without setting the `owner` property.',
  })
  @Post('/')
  async addDevice(@Res() res, @Body() createDeviceDto: CreateDeviceDTO) {
    if (
      !createDeviceDto.owner ||
      !Types.ObjectId.isValid(
        createDeviceDto.owner as unknown as Types.ObjectId,
      )
    ) {
      throw new BadRequestException(
        'The device must have an owner before it can be added.',
      );
    }

    const newDevice = await this.deviceService.addDevice(createDeviceDto);
    return res.status(HttpStatus.OK).json({
      message: 'Device has been created successfully',
      device: newDevice,
    });
  }

  @ApiOperation({
    summary: 'Get a device',
    description: 'Get a device.',
  })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: "Returned when the requested device could'nt be found",
  })
  @Get('/:deviceId')
  async getDevice(
    @Res() res,
    @Param('deviceId', new ValidateObjectId()) deviceId,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const device = await this.deviceService.getDeviceForUser(deviceId, userId);
    if (!device) {
      throw new NotFoundException('Device does not exist');
    }
    return res.status(HttpStatus.OK).json(device);
  }

  @ApiOperation({
    summary: 'Get a device by imei',
    description: 'Get a device by imei.',
  })
  @ApiParam({ name: 'imei', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: "Returned when the requested device could'nt be found",
  })
  @Get('/byImei/:imei')
  async getDeviceByImei(
    @Res() res,
    @Param('imei') imei,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const device = await this.deviceService.getDeviceByImei(imei);
    if (!device) {
      throw new NotFoundException('Device does not exist');
    }

    if (new Types.ObjectId(userId).toString() !== device.owner.toString()) {
      return res.status(HttpStatus.OK).json({});
    }

    return res.status(HttpStatus.OK).json(device);
  }

  @ApiOperation({
    summary: 'Get a device list',
    description: 'Get a device list',
  })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @Get('/')
  async getDevices(
    @Res() res,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const devices = await this.deviceService.getDevicesForUser(userId);
    return res.status(HttpStatus.OK).json(devices);
  }

  @ApiOperation({
    summary: 'Update a device device',
    description: 'Update a device device.',
  })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: "Returned when the requested device could'nt be found",
  })
  @Put('/:deviceId')
  async editDevice(
    @Res() res,
    @Param('deviceId', new ValidateObjectId()) deviceId,
    @Query('userId', new ValidateObjectId()) userId,
    @Body() createDeviceDto: CreateDeviceDTO,
  ) {
    const editedDevice = await this.deviceService.editDevice(
      deviceId,
      createDeviceDto,
    );
    if (!editedDevice) {
      throw new NotFoundException('Device does not exist');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Device has been successfully updated',
      device: editedDevice,
    });
  }

  @ApiOperation({
    summary: 'Delete a device',
    description:
      'Delete a device. Please make sure to corresponding data first. Once the device is removed, references to the devices data will be broken and not reachable anymore.',
  })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: "Returned when the requested device could'nt be found",
  })
  @Delete('/:deviceId')
  async deleteDevice(
    @Res() res,
    @Param('deviceId', new ValidateObjectId()) deviceId,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const deletedDevice = await this.deviceService.deleteDevice(deviceId);
    if (!deletedDevice) {
      throw new NotFoundException('Device does not exist');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Device has been deleted successfully',
      device: deletedDevice,
    });
  }
}
