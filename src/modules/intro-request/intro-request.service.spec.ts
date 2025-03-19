import { Test, TestingModule } from '@nestjs/testing';
import { IntroRequestService } from './intro-request.service';

describe('IntroRequestService', () => {
  let service: IntroRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IntroRequestService],
    }).compile();

    service = module.get<IntroRequestService>(IntroRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
