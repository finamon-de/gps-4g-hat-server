import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PositionSchema } from 'src/mongodb/schemas/position.schema';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';

@Module({
  imports: [
    MongooseModule.forFeature([{name: "Position", schema: PositionSchema}])
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [MongooseModule, PositionService]
})
export class PositionModule {}
