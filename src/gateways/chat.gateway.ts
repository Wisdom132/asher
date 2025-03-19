import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InChatService } from '../modules/in-chat/in-chat.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  private activeUsers = new Map<string, string>(); // userId -> socketId mapping

  constructor(private chatService: InChatService) {}

  // Handle user connection
  handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  // Handle user disconnection
  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = [...this.activeUsers.entries()].find(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) {
      this.activeUsers.delete(userId);
      this.server.emit('userDisconnected', userId);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
    }
  }

  // Register user socket
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() userId: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.activeUsers.set(userId, client.id);
    this.server.emit('userConnected', userId);
    this.logger.log(`User registered: ${userId} with socket ${client.id}`);
  }

  // Handle new messages
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    {
      senderId,
      receiverId,
      chatId,
      message,
    }: {
      senderId: string;
      receiverId: string;
      chatId: string;
      message: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    // Save the message to the database
    const savedMessage = await this.chatService.sendMessage(
      senderId,
      receiverId,
      chatId,
      message,
    );

    // Emit to sender
    client.emit('messageSent', savedMessage);

    // Emit to receiver if online
    const receiverSocketId = this.activeUsers.get(receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('newMessage', savedMessage);
    }
  }
}
