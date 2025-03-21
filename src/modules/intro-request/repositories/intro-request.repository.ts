import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { IntroductionStatus, UserType } from '@prisma/client';

@Injectable()
export class IntroRequestRepository {
  constructor(private prisma: PrismaService) {}

  async createIntroRequest(companyId: string, investorId: string) {
    if (companyId === investorId) {
      throw new ForbiddenException(
        'You cannot request an introduction to yourself.',
      );
    }

    // Check if they are already connected
    const existingConnection = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { investorId, companyId },
          { investorId: companyId, companyId: investorId },
        ],
      },
    });

    if (!existingConnection) {
      throw new ForbiddenException(
        'You must be connected before requesting an introduction.',
      );
    }

    // Check if an introduction request already exists
    const existingRequest = await this.prisma.introductionRequest.findFirst({
      where: {
        companyId,
        investorId,
        status: IntroductionStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        'An introduction request is already pending.',
      );
    }

    return this.prisma.introductionRequest.create({
      data: {
        companyId,
        investorId,
        status: IntroductionStatus.PENDING,
      },
    });
  }

  async getIntroRequestsForInvestor(investorId: string) {
    return this.prisma.introductionRequest.findMany({
      where: { investorId, status: IntroductionStatus.PENDING },
    });
  }

  async getIntroRequestById(requestId: string) {
    return this.prisma.introductionRequest.findUnique({
      where: { id: requestId },
    });
  }

  async getIntroRequestsForUser(userId: string, userType: UserType) {
    return this.prisma.introductionRequest.findMany({
      where:
        userType === UserType.Company
          ? { companyId: userId }
          : { investorId: userId },
    });
  }

  async updateIntroRequestStatus(
    requestId: string,
    status: IntroductionStatus,
  ) {
    return this.prisma.introductionRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }
}
