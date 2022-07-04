import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePositionDTO } from 'src/mongodb/dto/create-position.dto';
import { Position } from 'src/mongodb/interfaces/position.interface';

@Injectable()
export class PositionService {
    constructor(@InjectModel("Position") private readonly positionModel: Model<Position>) {}

    async addPosition(createPositionDto: CreatePositionDTO): Promise<Position> {
        const newPosition = new this.positionModel(createPositionDto);
        return newPosition.save();
    }

    async getPosition(positionId): Promise<Position> {
        const position = await this.positionModel.findById(positionId).exec();
        return position;
    }

    async getPositions(): Promise<Position[]> {
        const positions = await this.positionModel.find().exec();
        return positions;
    }

    async getPositionsForDevice(deviceId): Promise<Position[]> {
        const positions = await this.positionModel.find().exec();
        const testObjStr = new Types.ObjectId(deviceId).toString();
        return positions.filter(p => testObjStr === deviceId.toString());
    }

    async deletePosition(positionId): Promise<any> {
        const deletedPosition = await this.positionModel.findOneAndRemove(positionId).exec();
        return deletedPosition;
    }
}
