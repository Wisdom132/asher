import { IsUUID, IsEnum } from 'class-validator';
import { IntroductionStatus } from '@prisma/client';

export class UpdateIntroRequestDto {
  @IsUUID()
  requestId: string;

  @IsEnum(IntroductionStatus)
  status: IntroductionStatus;
}

export class CreateIntroRequestDto {
  @IsUUID()
  investorId: string;
}
