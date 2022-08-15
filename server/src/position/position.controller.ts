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
import { CreatePositionDTO } from 'src/database/mongodb/dto/create-position.dto';
import { ValidateObjectId } from 'src/database/mongodb/shared/pipes/validate-object-id.pipes';
import { PositionService } from './position.service';
import {
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('position')
@Controller('/positions')
export class PositionController {
  constructor(private positionService: PositionService) {}

  @ApiOperation({
    summary: 'Add a new position.',
    description:
      'Add a new position. It is required that the `device` property is set.',
  })
  @ApiOkResponse({ description: 'Success message' })
  @ApiBadRequestResponse({
    description: "The `device` property wasn't set properly.",
  })
  @Post('/')
  async addPosition(@Res() res, @Body() createPositionDto: CreatePositionDTO) {
    if (
      !createPositionDto.device ||
      !Types.ObjectId.isValid(
        createPositionDto.device as unknown as Types.ObjectId,
      )
    ) {
      throw new BadRequestException('Property `device` is not set properly.');
    }

    const newPosition = await this.positionService.addPosition(
      createPositionDto,
    );
    return res.status(HttpStatus.OK).json({
      message: 'Position has been added sucessfully',
      position: newPosition,
    });
  }

  @ApiOperation({
    summary: 'Get a position.',
    description: 'Get a position.',
  })
  @ApiParam({ name: 'positionId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: 'Position was not found or does not exist.',
  })
  @Get('/:positionId')
  async getPosition(
    @Res() res,
    @Param('positionId', new ValidateObjectId()) positionId,
  ) {
    const position = await this.positionService.getPosition(positionId);
    if (!position) {
      throw new NotFoundException('Position does not exist');
    }
    return res.status(HttpStatus.OK).json(position);
  }

  @ApiOperation({
    summary: 'Get positions for a device.',
    description: 'Get positions for a device.',
  })
  @ApiQuery({ name: 'deviceId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @Get('/')
  async getPositions(
    @Res() res,
    @Query('deviceId', new ValidateObjectId()) deviceId,
  ) {
    const positions = await this.positionService.getPositionsForDevice(
      deviceId,
    );
    return res.status(HttpStatus.OK).json(positions);
  }

  @ApiOperation({
    summary: 'Remove a position.',
    description: 'Remove a position.',
  })
  @ApiQuery({ name: 'deviceId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: 'Position was not found or does not exist.',
  })
  @Get('/latest')
  async getLatestPositionsForDevice(
    @Res() res,
    @Query('deviceId', new ValidateObjectId()) deviceId,
  ) {
    const position = await this.positionService.getLatestPositionsForDevice(
      deviceId,
    );
    if (!position) {
      throw new NotFoundException('Position does not exist');
    }
    return res.status(HttpStatus.OK).json(position);
  }

  @ApiOperation({
    summary: 'Remove a position.',
    description: 'Remove a position.',
  })
  @ApiParam({ name: 'positionId', type: 'string' })
  @ApiOkResponse({ description: 'Success message' })
  @ApiNotFoundResponse({
    description: 'Position was not found or does not exist.',
  })
  @Delete('/:positionId')
  async deletePosition(
    @Res() res,
    @Param('positionId', new ValidateObjectId()) positionId,
  ) {
    const deletedPosition = await this.positionService.deletePosition(
      positionId,
    );
    if (!deletedPosition) {
      throw new NotFoundException('Position does not exist');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Position has been deleted successfully',
      position: deletedPosition,
    });
  }
}
