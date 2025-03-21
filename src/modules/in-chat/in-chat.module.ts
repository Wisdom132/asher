import { Module } from '@nestjs/common';
import { InChatService } from './in-chat.service';
import { InChatController } from './in-chat.controller';
import { InChatRepository } from './repositories/in-chat.repository';
import { ChatGateway } from './in-chat.gateway';
@Module({
  providers: [InChatService, InChatRepository, ChatGateway],
  controllers: [InChatController],
})
export class InChatModule {}
