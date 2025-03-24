import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InChatRepository {
  constructor(private prisma: PrismaService) {}

  async saveMessage(senderId: string, connectionId: string, message: string) {
    return await this.prisma.chatMessage.create({
      data: { senderId, connectionId, message },
    });
  }

  // Get all messages in a conversation (between connected users)
  async getChatMessages(connectionId: string) {
    return await this.prisma.chatMessage.findMany({
      where: { connectionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Get messages between two users in a connection
  async getMessagesBetweenUsers(user1Id: string, user2Id: string) {
    return await this.prisma.chatMessage.findMany({
      where: {
        connection: {
          OR: [
            { investorId: user1Id, companyId: user2Id },
            { investorId: user2Id, companyId: user1Id },
          ],
        },
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Update message status
  async updateMessageStatus(
    messageId: string,
    status: 'SENT' | 'DELIVERED' | 'READ',
  ) {
    return await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { status },
    });
  }

  // Soft delete a message
  async softDeleteMessage(messageId: string) {
    return await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }
}
