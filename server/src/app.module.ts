import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// mongoose
import { MongooseModule } from "@nestjs/mongoose";

// custom
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';
import { DeviceService } from './device/device.service';
import { UserController } from './user/user.controller';
import { DeviceController } from './device/device.controller';
import { DeviceModule } from './device/device.module';
import { MqttController } from './mqtt/mqtt.controller';
import { PositionModule } from './position/position.module';
import { AccSensorModule } from './acc-sensor/acc-sensor.module';

const mongooseConnectionUrl = 'mongodb://localhost/test-database'

@Module({
  imports: [
    MongooseModule.forRoot(mongooseConnectionUrl, { useNewUrlParser: true }),
    UserModule,
    DeviceModule,
    PositionModule,
    AccSensorModule,
    ConfigModule.forRoot({
      envFilePath: [ ".local.env", ".sample.env" ],
      isGlobal: true
    })
  ],
  controllers: [AppController, UserController, DeviceController, MqttController],
  providers: [AppService, UserService, DeviceService],
})
export class AppModule {}
