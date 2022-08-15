import { Test, TestingModule } from '@nestjs/testing';
import { AccSensorController } from './acc-sensor.controller';

describe('AccSensorController', () => {
  let controller: AccSensorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccSensorController],
    }).compile();

    controller = module.get<AccSensorController>(AccSensorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
