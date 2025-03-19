import { Module } from '@nestjs/common';
import { IntroRequestService } from './intro-request.service';
import { IntroRequestController } from './intro-request.controller';
import { IntroRequestRepository } from './repositories/intro-request.repository';

@Module({
  providers: [IntroRequestService, IntroRequestRepository],
  controllers: [IntroRequestController],
})
export class IntroRequestModule {}
