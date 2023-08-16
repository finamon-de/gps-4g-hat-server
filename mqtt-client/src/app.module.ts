import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ClientsModule.register([{
      name: 'MQTT_SERVICE',
      transport: Transport.MQTT,
      options: {
        url: "mqtt://localhost:1883",
        //url: "mqtt://23.88.108.59:1883",
        // username: "api",
        // password: "flake-iraq-contra",
      }
    }])
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
