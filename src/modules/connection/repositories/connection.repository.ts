import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConnectionStatus, UserType } from '@prisma/client';

@Injectable()
export class ConnectionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createConnectionRequest(companyId: string, investorId: string) {
    const company = await this.prisma.user.findUnique({
      where: { id: companyId, userType: UserType.Company },
    });

    if (!company) {
      throw new BadRequestException(
        'Invalid company ID. The company does not exist.',
      );
    }

    const investor = await this.prisma.user.findUnique({
      where: { id: investorId, userType: UserType.Investor },
    });

    if (!investor) {
      throw new BadRequestException(
        'Only investors can send connection requests.',
      );
    }

    const existingRequest = await this.prisma.connectionRequest.findFirst({
      where: {
        companyId,
        investorId,
        status: {
          in: [ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED],
        },
      },
    });

    if (existingRequest) {
      throw new BadRequestException('A connection request already exists.');
    }

    return this.prisma.connectionRequest.create({
      data: {
        companyId,
        investorId,
        status: ConnectionStatus.PENDING,
      },
    });
  }
  async updateConnectionRequestStatus(
    requestId: string,
    status: ConnectionStatus,
  ) {
    return this.prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status },
    });
  }

  async createConnection(
    companyId: string,
    investorId: string,
    telegramGroupId: string,
  ) {
    return this.prisma.connection.create({
      data: {
        companyId,
        investorId,
        telegramGroupId,
      },
    });
  }

  async getUserConnections(userId: string) {
    return this.prisma.connection.findMany({
      where: {
        OR: [{ companyId: userId }, { investorId: userId }],
      },
      include: { investor: true, company: true },
    });
  }

  async getUserConnectionRequests(
    userId: string,
    statuses: ConnectionStatus[],
  ) {
    return this.prisma.connectionRequest.findMany({
      where: {
        OR: [{ companyId: userId }, { investorId: userId }],
        status: { in: statuses },
      },
      include: { investor: true, company: true },
    });
  }

  async getConnectionRequestById(requestId: string) {
    return this.prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });
  }

  // async getConnectionRequestByStatus(
  //   companyId: string,
  //   investorId: string,
  //   statuses: ConnectionStatus | ConnectionStatus[],
  // ) {
  //   return this.prisma.connectionRequest.findFirst({
  //     where: {
  //       companyId,
  //       investorId,
  //       status: Array.isArray(statuses) ? { in: statuses } : statuses,
  //     },
  //   });
  // }

  async getConnectionRequestsByStatus(
    statuses: ConnectionStatus | ConnectionStatus[],
    userId?: string, // Optional filter for specific investor or company
    userType?: 'investor' | 'company', // Determines if userId refers to an investor or company
  ) {
    const whereClause: any = {
      status: Array.isArray(statuses) ? { in: statuses } : statuses,
    };

    if (userId && userType) {
      whereClause[userType === 'investor' ? 'investorId' : 'companyId'] =
        userId;
    }

    return this.prisma.connectionRequest.findMany({
      where: whereClause,
      include: {
        investor: true,
        company: true,
      },
    });
  }

  // async getAllConnections() {
  //   return this.prisma.connection.findMany({
  //     include: { investor: true, company: true },
  //   });
  // }
}
