import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { InChatService } from './in-chat.service';

@Controller('in-chats')
export class InChatController {
  constructor(private chatService: InChatService) {}

  @Post('send')
  async sendMessage(
    @Body()
    {
      senderId,
      chatId,
      message,
    }: {
      senderId: string;
      receiverId: string;
      chatId: string;
      message: string;
    },
  ) {
    return await this.chatService.sendMessage(senderId, chatId, message);
  }

  @Get(':chatId')
  async getChatMessages(@Param('chatId') chatId: string) {
    return await this.chatService.getChatMessages(chatId);
  }

  @Get('conversation/:user1Id/:user2Id')
  async getMessagesBetweenUsers(
    @Param('user1Id') user1Id: string,
    @Param('user2Id') user2Id: string,
  ) {
    return await this.chatService.getMessagesBetweenUsers(user1Id, user2Id);
  }

  @Post('read/:messageId')
  async markMessageAsRead(@Param('messageId') messageId: string) {
    return await this.chatService.markMessageAsRead(messageId);
  }

  @Post('delete/:messageId')
  async deleteMessage(@Param('messageId') messageId: string) {
    return await this.chatService.deleteMessage(messageId);
  }
}
