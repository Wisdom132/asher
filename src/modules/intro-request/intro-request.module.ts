import { Module } from '@nestjs/common';
import { IntroRequestService } from './intro-request.service';
import { IntroRequestController } from './intro-request.controller';
import { IntroRequestRepository } from './repositories/intro-request.repository';
import { ChatGateway } from './gateways/chat.gateway';
@Module({
  providers: [IntroRequestService, IntroRequestRepository, ChatGateway],
  controllers: [IntroRequestController],
})
export class IntroRequestModule {}
