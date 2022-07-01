import { Test, TestingModule } from '@nestjs/testing';
import { AccSensorService } from './acc-sensor.service';

describe('AccSensorService', () => {
  let service: AccSensorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccSensorService],
    }).compile();

    service = module.get<AccSensorService>(AccSensorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
