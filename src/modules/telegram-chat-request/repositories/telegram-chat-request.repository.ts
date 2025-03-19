import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatStatus, UserType } from '@prisma/client';

@Injectable()
export class TelegramChatRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createChatRequest(companyId: string, investorId: string) {
    const investor = await this.prisma.user.findUnique({
      where: { id: investorId, userType: UserType.Investor },
    });

    if (!investor) {
      throw new BadRequestException(
        'Only investors can initiate chat requests.',
      );
    }

    const company = await this.prisma.user.findUnique({
      where: { id: companyId, userType: UserType.Company },
    });

    if (!company) {
      throw new BadRequestException(
        'Invalid company ID. The company does not exist.',
      );
    }

    const existingConnection = await this.prisma.connection.findFirst({
      where: {
        OR: [
          { investorId, companyId },
          { investorId: companyId, companyId: investorId }, // Just in case
        ],
      },
    });

    if (!existingConnection) {
      throw new ForbiddenException(
        'You must be connected before initiating a chat.',
      );
    }

    const existingChatRequest = await this.prisma.chatRequest.findFirst({
      where: {
        investorId,
        companyId,
        status: { in: ['PENDING', 'ACCEPTED'] }, // Check if a request exists that is not declined
      },
    });

    if (existingChatRequest) {
      throw new BadRequestException('A chat request already exists.');
    }

    return this.prisma.chatRequest.create({
      data: {
        companyId,
        investorId,
      },
    });
  }

  async findChatRequestById(requestId: string) {
    return this.prisma.chatRequest.findUnique({ where: { id: requestId } });
  }

  async updateChatStatus(requestId: string, status: ChatStatus) {
    return this.prisma.chatRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }
  async findUserChatRequests(userId: string, userType: UserType) {
    return this.prisma.chatRequest.findMany({
      where:
        userType === UserType.Investor
          ? { investorId: userId }
          : { companyId: userId },
      include: {
        investor: { select: { id: true, name: true, email: true } },
        company: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
