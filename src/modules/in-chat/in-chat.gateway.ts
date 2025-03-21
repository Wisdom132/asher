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

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

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
  handleMessage(
    @MessageBody() message: any,
    @ConnectedSocket() client: Socket,
  ) {
    console.log(`Message from ${client.id}:`, message);

    const recipientSocketId = this.users.get(message.recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('receiveMessage', message);
    }
  }
}
