import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConnectionRepository } from './repositories/connection.repository';
import { ConnectionStatus, UserType } from '@prisma/client';
import { UserRepository } from 'src/modules/user/repositories/user.repository';

@Injectable()
export class ConnectionService {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly userRepository: UserRepository,
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

    const connectedCompanyIds = new Set(
      connectedCompanies.map((conn) => conn.companyId),
    );

    // Return companies with connection status
    return allCompanies.map((company) => ({
      ...company,
      isConnected: connectedCompanyIds.has(company.id),
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

    const updatedRequest =
      await this.connectionRepository.updateConnectionRequestStatus(
        requestId,
        accept ? ConnectionStatus.ACCEPTED : ConnectionStatus.DECLINED,
      );

    if (accept) {
      await this.connectionRepository.createConnection(
        connectionRequest.companyId,
        connectionRequest.investorId,
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
