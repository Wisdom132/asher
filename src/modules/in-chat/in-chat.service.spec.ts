import { Test, TestingModule } from '@nestjs/testing';
import { InChatService } from './in-chat.service';

describe('InChatService', () => {
  let service: InChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InChatService],
    }).compile();

    service = module.get<InChatService>(InChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
