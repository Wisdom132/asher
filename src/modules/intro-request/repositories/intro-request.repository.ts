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
        status: 'PENDING',
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
      },
    });
  }

  async getIntroRequestsForInvestor(investorId: string) {
    return await this.prisma.introductionRequest.findMany({
      where: { investorId, status: 'PENDING' },
    });
  }

  async getIntroRequestById(requestId: string) {
    return await this.prisma.introductionRequest.findUnique({
      where: { id: requestId },
    });
  }

  async getIntroRequestsForUser(userId: string, userType: UserType) {
    if (userType === UserType.Company) {
      // Fetch introduction requests sent by the company
      return await this.prisma.introductionRequest.findMany({
        where: { companyId: userId },
      });
    } else if (userType === UserType.Investor) {
      // Fetch introduction requests received by the investor
      return await this.prisma.introductionRequest.findMany({
        where: { investorId: userId },
      });
    }

    throw new ForbiddenException('Invalid user type');
  }

  async updateIntroRequestStatus(
    requestId: string,
    status: IntroductionStatus,
  ) {
    return await this.prisma.introductionRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }
}
