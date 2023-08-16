import { NestFactory } from '@nestjs/core';
import { MqttOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './modules/app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Create and initialize the main API.
 * @returns Promise<INestApplication>
 */
const createNestApp = async (): Promise<INestApplication> => {
  const apiApp = await NestFactory.create(AppModule);

  apiApp.enableCors({
    origin: '*',
    optionsSuccessStatus: 204,
  });

  await apiApp.listen(process.env.API_PORT);

  return apiApp;
};

/**
 * Create and initialize the MQTT app.
 */
const createNestMqttApp = async () => {
  const mqttApp = await NestFactory.createMicroservice<MqttOptions>(AppModule, {
    transport: Transport.MQTT,
    options: {
      url: `${process.env.MQTT_CONNECTION_URL}:${process.env.MQTT_PORT}`,
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
    },
  });

  await mqttApp.listen();
};

/**
 * Create and intialize the API documentation.
 */
const createSwaggerDoc = async (apiApp: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('GPS 4G HAT API')
    .setDescription('API description for the GPS 4G HAT example project.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(apiApp, config);

  SwaggerModule.setup('docs', apiApp, document);
};

/**
 * Run initialization steps.
 */
async function bootstrap() {
  const apiApp = await createNestApp();
  await createNestMqttApp();
  await createSwaggerDoc(apiApp);
}

bootstrap().then(() => {
  console.info('Server is ready.');
});
