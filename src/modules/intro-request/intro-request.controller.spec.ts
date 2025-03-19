import { Test, TestingModule } from '@nestjs/testing';
import { IntroRequestController } from './intro-request.controller';

describe('IntroRequestController', () => {
  let controller: IntroRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IntroRequestController],
    }).compile();

    controller = module.get<IntroRequestController>(IntroRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
