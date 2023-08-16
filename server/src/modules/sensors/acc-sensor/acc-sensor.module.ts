import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccSensorController } from './acc-sensor.controller';
import { AccSensorService } from './acc-sensor.service';
import {
  AccelerationSensor,
  AccelerationSensorSchema,
} from 'src/database/mongodb/models/acceleration-sensor.model';

@Module({
  imports: [
    AccelerationSensor,
    MongooseModule.forFeature([
      { name: 'AccelerationSensor', schema: AccelerationSensorSchema },
    ]),
  ],
  controllers: [AccSensorController],
  providers: [AccSensorService],
  exports: [MongooseModule, AccSensorService],
})
export class AccSensorModule {}
