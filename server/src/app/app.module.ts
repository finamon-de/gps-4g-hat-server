import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// mongoose
import { MongooseModule } from '@nestjs/mongoose';

// custom
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { DeviceService } from '../device/device.service';
import { UserController } from '../user/user.controller';
import { DeviceController } from '../device/device.controller';
import { DeviceModule } from '../device/device.module';
import { MqttController } from '../communication/mqtt/mqtt.controller';
import { PositionModule } from '../position/position.module';
import { AccSensorModule } from '../sensors/acc-sensor/acc-sensor.module';
import { WebSocketModule } from '../communication/websockets/websockets.module';
import { WebSocketClient } from '../communication/websockets/client';
import { MqttModule } from '../communication/mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env', '.sample.env'],
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_CONNECTION_URL, {
      useNewUrlParser: true,
    }),
    UserModule,
    DeviceModule,
    PositionModule,
    AccSensorModule,
    WebSocketModule,
    MqttModule,
  ],
  controllers: [
    AppController,
    UserController,
    DeviceController,
    MqttController,
  ],
  providers: [AppService, UserService, DeviceService, WebSocketClient],
})
export class AppModule {}
