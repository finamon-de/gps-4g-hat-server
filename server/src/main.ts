import { NestFactory } from '@nestjs/core';
import { MqttOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // API
  const apiApp = await NestFactory.create(AppModule);
  apiApp.enableCors({
    origin: '*',
    optionsSuccessStatus: 204,
  });

  // Api Documentation
  const config = new DocumentBuilder()
    .setTitle('GPS 4G HAT API')
    .setDescription('API description for the GPS 4G HAT example project.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(apiApp, config);
  SwaggerModule.setup('docs', apiApp, document);

  await apiApp.listen(process.env.API_PORT);

  // MQTT
  const mqttApp = await NestFactory.createMicroservice<MqttOptions>(AppModule, {
    transport: Transport.MQTT,
    options: {
      url: `${process.env.MQTT_CONNECTION_URL}:${process.env.MQTT_PORT}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    },
  });

  await mqttApp.listen();
}
bootstrap().then(() => {
  /*do nothing*/
});
