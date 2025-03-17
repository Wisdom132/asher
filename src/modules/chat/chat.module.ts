import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatRepository } from './repositories/chat.repository';
import { TelegramModule } from '../telegram/telegram.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [TelegramModule, UserModule],
  providers: [ChatService, ChatRepository],
  controllers: [ChatController],
  exports: [ChatService, ChatRepository],
})
export class ChatModule {}
