import { BadRequestException, Injectable } from '@nestjs/common';
import { ChatRepository } from './repositories/chat.repository';
import { ChatStatus, UserType } from '@prisma/client';
import { TelegramService } from 'src/modules/telegram/telegram.service';
import { UserRepository } from '../user/repositories/user.repository';
@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userRepository: UserRepository,
    private readonly telegramService: TelegramService,
  ) {}

  async requestChat(companyId: string, investorId: string) {
    return this.chatRepository.createChatRequest(companyId, investorId);
  }

  async approveChat(requestId: string, companyId: string) {
    const request = await this.chatRepository.findChatRequestById(requestId);

    if (!request || request.companyId !== companyId) {
      throw new BadRequestException('Invalid request or not authorized');
    }

    const [investor, company] = await Promise.all([
      this.userRepository.findUserById(request.investorId),
      this.userRepository.findUserById(request.companyId),
    ]);

    if (!investor || !company) {
      throw new BadRequestException('Invalid users involved in chat request');
    }

    const groupId = await this.telegramService.createGroup(
      investor.name,
      company.name,
    );

    await Promise.all([
      this.telegramService.addUserToGroup(groupId, request.investorId),
      this.telegramService.addUserToGroup(groupId, request.companyId),
    ]);
    await Promise.all([
      this.telegramService.sendWelcomeMessage(
        groupId,
        investor.name,
        company.name,
      ),
      this.chatRepository.updateChatStatus(requestId, ChatStatus.ACCEPTED),
    ]);

    return { success: true, groupId };
  }

  async declineChat(chatId: string) {
    return this.chatRepository.updateChatStatus(chatId, ChatStatus.DECLINED);
  }
  async getUserChatRequests(userId: string, userType: UserType) {
    return this.chatRepository.findUserChatRequests(userId, userType);
  }
}
