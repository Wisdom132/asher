import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IntroRequestService } from '../intro-request.service';
import {
  CreateIntroRequestDto,
  UpdateIntroRequestDto,
} from '../dtos/intro-request.dto';
import { IntroductionStatus } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly introductionRequestService: IntroRequestService,
  ) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.onlineUsers.set(userId, client.id);
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('sendIntroductionRequest')
  async handleSendIntroductionRequest(
    client: Socket,
    payload: { companyId: string; investorId: string },
  ) {
    console.log('Received introduction request:', payload);
    const createIntroDto: CreateIntroRequestDto = {
      investorId: payload.investorId,
    };

    const introductionRequest =
      await this.introductionRequestService.requestIntroduction(
        payload.companyId,
        createIntroDto,
      );

    const investorSocketId = this.onlineUsers.get(payload.investorId);

    if (investorSocketId) {
      this.server
        .to(investorSocketId)
        .emit('newIntroductionRequest', introductionRequest);
    }
  }

  @SubscribeMessage('respondToIntroductionRequest')
  async handleRespondToIntroductionRequest(
    client: Socket,
    payload: { requestId: string; status: string; investorId: string },
  ) {
    console.log('responding to intro request');
    const updateIntroDto: UpdateIntroRequestDto = {
      requestId: payload.requestId,
      status: payload.status as IntroductionStatus,
    };

    const updatedRequest =
      await this.introductionRequestService.respondToIntroduction(
        updateIntroDto,
        payload.investorId,
      );

    const companySocketId = this.onlineUsers.get(updatedRequest.companyId);
    const investorSocketId = this.onlineUsers.get(updatedRequest.investorId);

    if (companySocketId) {
      this.server
        .to(companySocketId)
        .emit('introductionRequestUpdated', updatedRequest);
    }
    if (investorSocketId) {
      this.server
        .to(investorSocketId)
        .emit('introductionRequestUpdated', updatedRequest);
    }
  }
}
