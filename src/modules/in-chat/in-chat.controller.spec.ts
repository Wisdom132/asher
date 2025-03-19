import { Test, TestingModule } from '@nestjs/testing';
import { InChatController } from './in-chat.controller';

describe('InChatController', () => {
  let controller: InChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InChatController],
    }).compile();

    controller = module.get<InChatController>(InChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
