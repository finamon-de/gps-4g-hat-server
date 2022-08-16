import { Module } from '@nestjs/common';
import { MqttController } from './mqtt.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { WebSocketModule } from '../websockets/websockets.module';
import { PositionModule } from '../../position/position.module';
import { AccSensorModule } from '../../sensors/acc-sensor/acc-sensor.module';
import { DeviceService } from '../../device/device.service';
import { PositionService } from '../../position/position.service';
import { AccSensorService } from '../../sensors/acc-sensor/acc-sensor.service';
import { DeviceModule } from '../../device/device.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.local.env', '.sample.env'],
      isGlobal: true,
    }),
    ClientsModule.register([
      {
        name: 'MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: `${process.env.MQTT_CONNECTION_URL}:${process.env.MQTT_PORT}`,
          username: process.env.MQTT_USERNAME,
          password: process.env.MQTT_PASSWORD,
        },
      },
    ]),
    WebSocketModule,
    PositionModule,
    AccSensorModule,
    DeviceModule,
  ],
  controllers: [MqttController],
  providers: [DeviceService, PositionService, AccSensorService],
  exports: [ClientsModule],
})
export class MqttModule {}
