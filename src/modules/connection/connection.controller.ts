import {
  Controller,
  Post,
  Get,
  Patch,
  Req,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Request } from 'express';
import { ConnectionStatus, UserType } from '@prisma/client';
import { Roles } from 'src/guards/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('connections')
@UseGuards(JwtAuthGuard)
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('request')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Investor)
  async requestConnection(
    @Body() body: { companyId: string },
    @Req() req: Request,
  ) {
    const investorId = req.user.id;
    return this.connectionService.sendConnectionRequest(
      body.companyId,
      investorId,
    );
  }

  @Patch('respond/:requestId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Company)
  async respondToRequest(
    @Param('requestId') requestId: string,
    @Req() req: Request,
    @Body() body: { accept: boolean },
  ) {
    return this.connectionService.handleConnectionRequest(
      requestId,
      req.user.id,
      body.accept,
    );
  }

  @Get()
  async getUserConnections(@Req() req: Request) {
    return this.connectionService.getUserConnections(req.user.id);
  }

  @Get('requests')
  async getUserConnectionRequests(
    @Req() req: Request,
    @Query('statuses') statuses: ConnectionStatus[],
  ) {
    return this.connectionService.getUserConnectionRequests(
      req.user.id,
      statuses,
    );
  }
}
