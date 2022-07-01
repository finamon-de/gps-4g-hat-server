import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // API
  const apiApp = await NestFactory.create(AppModule);
  await apiApp.listen(4000);

  // MQTT
  const mqttApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.MQTT,
    options: {
      url: "mqtt://localhost:1883"
    }
  });
  await mqttApp.listen();
}
bootstrap();
