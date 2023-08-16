import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePositionDTO } from 'src/database/mongodb/dto/create-position.dto';
import {
  Position,
  PositionDocument,
} from 'src/database/mongodb/models/position.model';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel('Position')
    private readonly positionModel: Model<Position>,
  ) {}

  /**
   * Create a new position reocrd.
   * @param createPositionDto Data transfer object
   * @returns Promise<PositionModel>
   */
  async create(
    createPositionDto: CreatePositionDTO,
  ): Promise<PositionDocument> {
    const newPosition = new this.positionModel(createPositionDto);
    return newPosition.save();
  }

  /**
   * Find a position by id.
   * @param positionId Position id
   * @returns Promise<PositionModel>
   */
  async findById(positionId): Promise<PositionDocument> {
    const position = await this.positionModel.findById(positionId).exec();
    return position;
  }

  /**
   * Find all positions.
   * @returns Promise<PositionModel[]>
   */
  async findAll(): Promise<PositionDocument[]> {
    const positions = await this.positionModel.find().exec();
    return positions;
  }

  /**
   * Find all positions for a device.
   * @param deviceId Device id
   * @returns Promise<PositionModel[]>
   */
  async findForDevice(deviceId): Promise<PositionDocument[]> {
    const positions = await this.positionModel.find().exec();
    const testObjStr = new Types.ObjectId(deviceId).toString();
    return positions.filter((p) => testObjStr === p.device.toString());
  }

  /**
   * Find last position of a device.
   * @param deviceId Device id
   * @returns Promise<PositionModel>
   */
  async findLast(deviceId): Promise<PositionDocument> {
    const position = await this.positionModel.findOne(
      { device: new Types.ObjectId(deviceId) },
      {},
      { sort: { utc: -1 } },
    );
    return position;
  }

  /**
   * Delete a position.
   * @param positionId Position id
   * @returns Promise<any>
   */
  async deleteOne(positionId): Promise<any> {
    const deletedPosition = await this.positionModel
      .findOneAndRemove(positionId)
      .exec();
    return deletedPosition;
  }
}
