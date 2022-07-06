import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // API
  const apiApp = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('GPS 4G HAT API')
    .setDescription('API description for the GPS 4G HAT example project.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(apiApp, config);
  SwaggerModule.setup('docs', apiApp, document);

  await apiApp.listen(process.env.API_PORT);

  // MQTT
  const mqttApp = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.MQTT,
    options: {
      url: process.env.MQTT_CONNECTION_URL,

      // uncomment if necessary
      // username: process.env.MQTT_USERNAME,
      // password: process.env.MQTT_PASSWORD
    }
  });
  await mqttApp.listen();
}
bootstrap();
