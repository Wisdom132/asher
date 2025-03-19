import {
  Controller,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { TelegramChatRequestService } from './telegram-chat-request.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { UserType } from '@prisma/client';
import { Roles } from 'src/guards/decorators/roles.decorator';
import { Request } from 'express';

@Controller('chats')
export class TelegramChatRequestController {
  constructor(private readonly chatService: TelegramChatRequestService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Investor)
  async requestChat(@Body() body: { companyId: string }, @Req() req: Request) {
    return this.chatService.requestChat(body.companyId, req.user.id);
  }

  @Patch('approve/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Company)
  async approveChat(
    @Param('requestId') requestId: string,
    @Req() req: Request,
  ) {
    return this.chatService.approveChat(requestId, req.user.id);
  }

  @Patch('decline/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Company)
  async declineChat(@Param('requestId') requestId: string) {
    return this.chatService.declineChat(requestId);
  }

  @Get('requests')
  @UseGuards(JwtAuthGuard)
  async getUserChatRequests(@Req() req: Request) {
    return this.chatService.getUserChatRequests(req.user.id, req.user.userType);
  }
}
