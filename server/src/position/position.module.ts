import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionSchema } from 'src/database/mongodb/schemas/position.schema';
import { PositionController } from './position.controller';
import { PositionGateway } from './position.gateway';
import { PositionService } from './position.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Position', schema: PositionSchema }]),
  ],
  controllers: [PositionController],
  providers: [PositionService, PositionGateway],
  exports: [MongooseModule, PositionService],
})
export class PositionModule {}
