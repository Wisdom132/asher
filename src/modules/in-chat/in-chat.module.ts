import { Module } from '@nestjs/common';
import { InChatService } from './in-chat.service';
import { InChatController } from './in-chat.controller';
import { InChatRepository } from './repositories/in-chat.repository';
@Module({
  providers: [InChatService, InChatRepository],
  controllers: [InChatController],
})
export class InChatModule {}
