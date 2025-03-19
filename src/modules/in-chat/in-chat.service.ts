import { Injectable } from '@nestjs/common';
import { InChatRepository } from './repositories/in-chat.repository';

@Injectable()
export class InChatService {
  constructor(private inChatRepository: InChatRepository) {}

  async sendMessage(
    senderId: string,
    receiverId: string,
    chatId: string,
    message: string,
  ) {
    return await this.inChatRepository.saveMessage(
      senderId,
      receiverId,
      chatId,
      message,
    );
  }

  async getChatMessages(chatId: string) {
    return await this.inChatRepository.getChatMessages(chatId);
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string) {
    return await this.inChatRepository.getMessagesBetweenUsers(
      user1Id,
      user2Id,
    );
  }

  async markMessageAsRead(messageId: string) {
    return await this.inChatRepository.updateMessageStatus(messageId, 'READ');
  }

  async deleteMessage(messageId: string) {
    return await this.inChatRepository.softDeleteMessage(messageId);
  }
}
