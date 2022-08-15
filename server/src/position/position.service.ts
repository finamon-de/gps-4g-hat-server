import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePositionDTO } from 'src/database/mongodb/dto/create-position.dto';
import { Position } from 'src/interfaces/position.interface';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel('Position') private readonly positionModel: Model<Position>,
  ) {}

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
    return positions.filter((p) => testObjStr === p.device.toString());
  }

  async getLatestPositionsForDevice(deviceId): Promise<Position> {
    const position = await this.positionModel.findOne(
      { device: new Types.ObjectId(deviceId) },
      {},
      { sort: { utc: -1 } },
    );
    return position;
  }

  async deletePosition(positionId): Promise<any> {
    const deletedPosition = await this.positionModel
      .findOneAndRemove(positionId)
      .exec();
    return deletedPosition;
  }
}
