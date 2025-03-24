import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConnectionRepository } from './repositories/connection.repository';
import { ConnectionStatus, UserType } from '@prisma/client';
import { UserRepository } from 'src/modules/user/repositories/user.repository';
import { TelegramService } from 'src/modules/telegram/telegram.service';

@Injectable()
export class ConnectionService {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly userRepository: UserRepository,
    private readonly telegramService: TelegramService,
  ) {}

  async sendConnectionRequest(companyId: string, investorId: string) {
    return this.connectionRepository.createConnectionRequest(
      companyId,
      investorId,
    );
  }

  async getCompaniesWithConnectionStatus(investorId: string) {
    const allCompanies = await this.userRepository.getUsersByType(
      UserType.Company,
    );
    const connectedCompanies = await this.getUserConnections(investorId);
    const pendingRequests =
      await this.connectionRepository.getConnectionRequestsByStatus(
        ConnectionStatus.PENDING,
        investorId,
        'investor',
      );

    const connectedCompanyIds = new Set(
      connectedCompanies.map((conn) => conn.companyId),
    );
    const pendingCompanyIds = new Set(
      pendingRequests.map((req) => req.companyId),
    );

    // Return companies with connection status
    return allCompanies.map((company) => ({
      ...company,
      isConnected: connectedCompanyIds.has(company.id),
      isPending: pendingCompanyIds.has(company.id),
    }));
  }

  async handleConnectionRequest(
    requestId: string,
    userId: string,
    accept: boolean,
  ) {
    const connectionRequest =
      await this.connectionRepository.getConnectionRequestById(requestId);

    if (!connectionRequest) {
      throw new NotFoundException('Connection request not found.');
    }

    if (connectionRequest.companyId !== userId) {
      throw new ForbiddenException(
        'Only the company can accept or decline this request.',
      );
    }

    const [investor, company] = await Promise.all([
      this.userRepository.findUserById(connectionRequest.investorId),
      this.userRepository.findUserById(connectionRequest.companyId),
    ]);

    const updatedRequest =
      await this.connectionRepository.updateConnectionRequestStatus(
        requestId,
        accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.DECLINED,
      );

    if (accept) {
      const groupCreationResponse = await this.telegramService.createGroup(
        investor.name,
        company.name,
        [investor.telegramHandle, company.telegramHandle],
      );
      const groupId = groupCreationResponse.updates.chats[0].id;
      console.log('groupId details', String(groupId));
      await this.telegramService.setBotAsGroupAdmin(String(groupId));
      await this.connectionRepository.createConnection(
        connectionRequest.companyId,
        connectionRequest.investorId,
        String(groupId),
      );
    }

    return updatedRequest;
  }

  async getUserConnections(userId: string) {
    return this.connectionRepository.getUserConnections(userId);
  }

  async getUserConnectionRequests(
    userId: string,
    statuses: ConnectionStatus[],
  ) {
    return this.connectionRepository.getUserConnectionRequests(
      userId,
      statuses,
    );
  }
}
