import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IntroRequestRepository } from './repositories/intro-request.repository';
import {
  CreateIntroRequestDto,
  UpdateIntroRequestDto,
} from './dtos/intro-request.dto';
import { UserType } from '@prisma/client';

@Injectable()
export class IntroRequestService {
  constructor(private readonly introRequestRepo: IntroRequestRepository) {}

  async requestIntroduction(
    companyId: string,
    createIntroDto: CreateIntroRequestDto,
  ) {
    return await this.introRequestRepo.createIntroRequest(
      companyId,
      createIntroDto.investorId,
    );
  }

  async getPendingRequests(investorId: string) {
    return await this.introRequestRepo.getIntroRequestsForInvestor(investorId);
  }

  async getCompanyIntroRequestById(requestId: string, companyId: string) {
    const introRequest =
      await this.introRequestRepo.getIntroRequestById(requestId);

    if (!introRequest) {
      throw new NotFoundException('Introduction request not found');
    }

    if (introRequest.companyId !== companyId) {
      throw new ForbiddenException(
        'You are not authorized to view this request.',
      );
    }

    return introRequest;
  }

  async getIntroRequestsForUser(userId: string, userType: UserType) {
    return await this.introRequestRepo.getIntroRequestsForUser(
      userId,
      userType,
    );
  }

  async respondToIntroduction(
    updateIntroDto: UpdateIntroRequestDto,
    investorId: string,
  ) {
    const introRequest = await this.introRequestRepo.getIntroRequestById(
      updateIntroDto.requestId,
    );

    if (!introRequest) {
      throw new NotFoundException('Introduction request not found');
    }

    if (introRequest.investorId !== investorId) {
      throw new ForbiddenException(
        'You are not authorized to update this request',
      );
    }

    return await this.introRequestRepo.updateIntroRequestStatus(
      updateIntroDto.requestId,
      updateIntroDto.status,
    );
  }
}
