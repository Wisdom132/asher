import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InChatRepository {
  constructor(private prisma: PrismaService) {}

  // Save a new chat message
  async saveMessage(
    senderId: string,
    receiverId: string,
    chatId: string,
    message: string,
  ) {
    return this.prisma.chatMessage.create({
      data: { senderId, receiverId, chatId, message },
    });
  }

  // Get all messages in a conversation
  async getChatMessages(chatId: string) {
    return this.prisma.chatMessage.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Get messages between two users
  async getMessagesBetweenUsers(user1Id: string, user2Id: string) {
    return this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Update message status
  async updateMessageStatus(
    messageId: string,
    status: 'SENT' | 'DELIVERED' | 'READ',
  ) {
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { status },
    });
  }

  // Soft delete a message
  async softDeleteMessage(messageId: string) {
    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }
}
