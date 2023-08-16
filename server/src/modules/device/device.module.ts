import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { Device, DeviceSchema } from 'src/database/mongodb/models/device.model';

@Module({
  imports: [
    Device,
    MongooseModule.forFeature([{ name: 'Device', schema: DeviceSchema }]),
  ],
  providers: [DeviceService],
  controllers: [DeviceController],
  exports: [MongooseModule, DeviceService],
})
export class DeviceModule {}
