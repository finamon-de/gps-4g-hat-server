import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateDeviceDTO } from 'src/database/mongodb/dto/create-device.dto';
import { ValidateObjectId } from 'src/database/mongodb/shared/pipes/validate-object-id.pipes';
import { DeviceService } from './device.service';
import {
  ApiTags,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { DeviceOwnerGuard } from './device-owner.guard';

@ApiTags('device')
@Controller('/devices')
export class DeviceController {
  constructor(private deviceService: DeviceService) {}

  /**
   * Create a new device.
   * @param createDeviceDto Data transfer object
   * @returns DeviceModel
   */
  @ApiOperation({
    summary: 'Create a new device',
    description:
      'Create a new device. It is required that the `owner` property is set.',
  })
  @ApiOkResponse({ description: 'Success message' })
  @UseGuards(DeviceOwnerGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async addDevice(@Body() createDeviceDto: CreateDeviceDTO) {
    // TODO Remove if guard works
    //
    // if (
    //   !createDeviceDto.owner ||
    //   !Types.ObjectId.isValid(
    //     createDeviceDto.owner as unknown as Types.ObjectId,
    //   )
    // ) {
    //   throw new BadRequestException(
    //     'The device must have an owner before it can be added.',
    //   );
    // }

    const newDevice = await this.deviceService.create(createDeviceDto);
    return newDevice;
  }

  /**
   * Get a device.
   * @param deviceId Device id
   * @param userId User id
   * @returns DeviceModel
   */
  @ApiOperation({
    summary: 'Get a device',
    description: 'Get a device.',
  })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @HttpCode(HttpStatus.OK)
  @Get('/:deviceId')
  async getDevice(
    @Param('deviceId', new ValidateObjectId()) deviceId,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const device = await this.deviceService.findOneForUser(deviceId, userId);
    return device;
  }

  /**
   * Get a device by its IMEI.
   * The given user must be the owner.
   * @param imei IMEI
   * @param userId User id
   * @returns DeviceModel
   * @throws NotFoundException
   */
  @ApiOperation({
    summary: 'Get a device by imei',
    description: 'Get a device by imei.',
  })
  @ApiParam({ name: 'imei', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description:
      'Returned when device was not found, or device owner does not match the given user id.',
  })
  @HttpCode(HttpStatus.OK)
  @Get('/byImei/:imei')
  async getDeviceByImei(
    @Param('imei') imei,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const device = await this.deviceService.findByImei(imei);

    if (
      !device ||
      new Types.ObjectId(userId).toString() !== device.owner.toString()
    ) {
      throw new NotFoundException(
        "Device does not exist, or user id does not match the owner's id",
      );
    }

    return device;
  }

  /**
   * Find all devices for a given user id.
   * @param userId User id
   * @returns DeviceModel[]
   */
  @ApiOperation({
    summary: 'Get a device list',
    description: 'Get a device list',
  })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @HttpCode(HttpStatus.OK)
  @Get('/')
  async getDevices(@Query('userId', new ValidateObjectId()) userId) {
    const devices = await this.deviceService.findForUser(userId);
    return devices;
  }

  /**
   * Update a device.
   * @param deviceId Device id
   * @param userId User id
   * @param createDeviceDto Data transfer object
   * @returns DeviceModel
   * @throws NotFoundException
   */
  @ApiOperation({
    summary: 'Update a device device',
    description: 'Update a device device.',
  })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiBody({ description: 'An object matching the device schema' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: "Returned when the requested device could'nt be found",
  })
  @HttpCode(HttpStatus.OK)
  @Patch('/:deviceId')
  async updateDevice(
    @Param('deviceId', new ValidateObjectId()) deviceId,
    @Query('userId', new ValidateObjectId()) userId,
    @Body() createDeviceDto: CreateDeviceDTO,
  ) {
    const device = await this.deviceService.findOneForUser(deviceId, userId);
    if (!device) throw new NotFoundException('Device does not exist');

    const editedDevice = await this.deviceService.updateByDto(
      deviceId,
      createDeviceDto,
    );

    return editedDevice;
  }

  /**
   * Delete a device.
   * @param deviceId Device id
   * @param userId User id
   * @returns DeviceModel
   * @throws NotFoundException
   */
  @ApiOperation({
    summary: 'Delete a device',
    description:
      'Delete a device. Please make sure to delete corresponding data first. Once the device is removed, references to the devices data will be broken and not reachable anymore.',
  })
  @ApiParam({ name: 'deviceId', type: 'string' })
  @ApiQuery({ name: 'userId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: "Returned when the requested device could'nt be found",
  })
  @HttpCode(HttpStatus.OK)
  @Delete('/:deviceId')
  async deleteDevice(
    @Param('deviceId', new ValidateObjectId()) deviceId,
    @Query('userId', new ValidateObjectId()) userId,
  ) {
    const device = await this.deviceService.findOneForUser(deviceId, userId);
    if (!device) throw new NotFoundException('Device does not exist');

    const deletedDevice = await this.deviceService.deleteById(deviceId);

    return deletedDevice;
  }
}
