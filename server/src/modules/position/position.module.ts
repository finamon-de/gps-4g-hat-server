import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionController } from './position.controller';
import { PositionGateway } from './position.gateway';
import { PositionService } from './position.service';
import {
  Position,
  PositionSchema,
} from 'src/database/mongodb/models/position.model';

@Module({
  imports: [
    Position,
    MongooseModule.forFeature([{ name: 'Position', schema: PositionSchema }]),
  ],
  controllers: [PositionController],
  providers: [PositionService, PositionGateway],
  exports: [MongooseModule, PositionService],
})
export class PositionModule {}
