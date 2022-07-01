import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Query, Res } from '@nestjs/common';
import { CreatePositionDTO } from 'src/mongodb/dto/create-position.dto';
import { ValidateObjectId } from 'src/mongodb/shared/pipes/validate-object-id.pipes';
import { PositionService } from './position.service';

@Controller('/positions')
export class PositionController {
    constructor(private positionService: PositionService) {}

    @Post("/")
    async addPosition(@Res() res, @Body() createPositionDto: CreatePositionDTO) {
        const newPosition = await this.positionService.addPosition(createPositionDto);
        return res.status(HttpStatus.OK).json({
            message: "Position has been added sucessfully",
            position: newPosition
        })
    }

    @Get("/:positionId")
    async getPosition(
        @Res() res,
        @Param("positionId", new ValidateObjectId()) positionId,
    ) {
        const position = await this.positionService.getPosition(positionId);
        if(!position) {
            throw new NotFoundException("Position does not exist");
        }
        return res.status(HttpStatus.OK).json(position);
    }

    @Get("/")
    async getPositions(
        @Res() res,
        @Query("deviceId", new ValidateObjectId()) deviceId
    ) {
        const positions = await this.positionService.getPositionsForDevice(deviceId);
        return res.status(HttpStatus.OK).json(positions);
    }

    @Delete("/delete")
    async deletePosition(
        @Res() res,
        @Query("positionId", new ValidateObjectId()) positionId
    ) {
        const deletedPosition = await this.positionService.deletePosition(positionId);
        if (!deletedPosition) {
            throw new NotFoundException("Position does not exist");
        }
        return res.status(HttpStatus.OK).json({
            message: "Position has been deleted successfully",
            position: deletedPosition
        })
    }
}
