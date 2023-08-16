import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePositionDTO } from 'src/database/mongodb/dto/create-position.dto';
import { ValidateObjectId } from 'src/database/mongodb/shared/pipes/validate-object-id.pipes';
import { PositionService } from './position.service';
import {
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('position')
@Controller('/positions')
export class PositionController {
  constructor(private positionService: PositionService) {}

  /**
   * Create a new position entry.
   * @param createPositionDto Data transfer object
   * @returns Position object
   * @throws BadRequestException
   */
  @ApiOperation({
    summary: 'Add a new position.',
    description:
      'Add a new position. It is required that the `device` property is set.',
  })
  @ApiOkResponse({ description: 'Success message' })
  @ApiBadRequestResponse({
    description: "The `device` property wasn't set properly.",
  })
  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async create(@Body() createPositionDto: CreatePositionDTO) {
    if (
      !createPositionDto.device ||
      !Types.ObjectId.isValid(
        createPositionDto.device as unknown as Types.ObjectId,
      )
    ) {
      throw new BadRequestException('Property `device` is not set properly.');
    }

    const newPosition = await this.positionService.create(createPositionDto);

    return newPosition;
  }

  /**
   * Retrieve information about a certain position.
   * @param positionId Position id
   * @returns Position object
   */
  @ApiOperation({
    summary: 'Get a position.',
    description: 'Get a position.',
  })
  @ApiParam({ name: 'positionId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @HttpCode(HttpStatus.OK)
  @Get('/:positionId')
  async getOne(@Param('positionId', new ValidateObjectId()) positionId) {
    const position = await this.positionService.findById(positionId);
    return position;
  }

  /**
   * Get all positions for a device.
   * @param deviceId Device id
   * @returns Array of position objects.
   */
  @ApiOperation({
    summary: 'Get positions for a device.',
    description: 'Get positions for a device.',
  })
  @ApiQuery({ name: 'deviceId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @HttpCode(HttpStatus.OK)
  @Get('/')
  async getAll(@Query('deviceId', new ValidateObjectId()) deviceId) {
    const positions = await this.positionService.findForDevice(deviceId);
    return positions;
  }

  /**
   * Get latest position for a device.
   * @param deviceId Device id
   * @returns Position object
   */
  @ApiOperation({
    summary: 'Remove a position.',
    description: 'Remove a position.',
  })
  @ApiQuery({ name: 'deviceId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @HttpCode(HttpStatus.OK)
  @Get('/latest')
  async getLatestPositionsForDevice(
    @Query('deviceId', new ValidateObjectId()) deviceId,
  ) {
    const position = await this.positionService.findLast(deviceId);
    return position;
  }

  /**
   * Delete a position.
   * @param positionId Position id
   * @returns Position object
   */
  @ApiOperation({
    summary: 'Remove a position.',
    description: 'Remove a position.',
  })
  @ApiParam({ name: 'positionId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @HttpCode(HttpStatus.OK)
  @Delete('/:positionId')
  async deletePosition(
    @Param('positionId', new ValidateObjectId()) positionId,
  ) {
    const deletedPosition = await this.positionService.deleteOne(positionId);
    return deletedPosition;
  }
}
