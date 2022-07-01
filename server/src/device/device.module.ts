import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeviceSchema } from 'src/mongodb/schemas/device.schema';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: "Device", schema: DeviceSchema}])
    ],
    providers: [ DeviceService ],
    controllers: [ DeviceController ],
    exports: [ MongooseModule, DeviceService ]
})
export class DeviceModule {}
