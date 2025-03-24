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
import { InChatService } from './in-chat.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: InChatService) {}

  private users = new Map(); // Store connected users

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) this.users.set(userId, client.id);
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.users.entries()].find(
      ([, socketId]) => socketId === client.id,
    )?.[0];
    if (userId) this.users.delete(userId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Message from ${client.id}:`, message);

    const savedMessage = await this.chatService.sendMessage(
      message.senderId,
      message.connectionId, // Changed from chatId to connectionId
      message.message,
    );

    const recipientSocketId = this.users.get(message.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('receiveMessage', savedMessage);
    }
    client.emit('receiveMessage', savedMessage);
  }

  @SubscribeMessage('fetchMessages')
  async fetchMessages(
    @MessageBody() { connectionId }: { connectionId: string }, // Updated field
    @ConnectedSocket() client: Socket,
  ) {
    const messages = await this.chatService.getChatMessages(connectionId);
    client.emit('messagesHistory', messages);
  }
}
