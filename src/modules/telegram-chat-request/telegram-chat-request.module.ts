import { Module } from '@nestjs/common';
import { TelegramChatRequestService } from './telegram-chat-request.service';
import { TelegramChatRequestController } from './telegram-chat-request.controller';
import { TelegramChatRequestRepository } from './repositories/telegram-chat-request.repository';
import { TelegramModule } from '../telegram/telegram.module';
import { UserModule } from '../user/user.module';
@Module({
  imports: [TelegramModule, UserModule],
  providers: [TelegramChatRequestService, TelegramChatRequestRepository],
  controllers: [TelegramChatRequestController],
  exports: [TelegramChatRequestService, TelegramChatRequestRepository],
})
export class TelegramChatRequestModule {}
