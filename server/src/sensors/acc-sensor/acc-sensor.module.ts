import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccSensorSchema } from 'src/database/mongodb/schemas/acc-sensor.schema';
import { AccSensorController } from './acc-sensor.controller';
import { AccSensorService } from './acc-sensor.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'AccSensor', schema: AccSensorSchema }]),
  ],
  controllers: [AccSensorController],
  providers: [AccSensorService],
  exports: [MongooseModule, AccSensorService],
})
export class AccSensorModule {}
