import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IntroRequestService } from './intro-request.service';
import {
  CreateIntroRequestDto,
  UpdateIntroRequestDto,
} from './dtos/intro-request.dto';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { Request } from 'express';
import { UserType } from '@prisma/client';
import { Roles } from 'src/guards/decorators/roles.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('intro-requests')
@UseGuards(JwtAuthGuard)
export class IntroRequestController {
  constructor(private readonly introRequestService: IntroRequestService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.Company)
  async createIntroRequest(
    @Body() createIntroDto: CreateIntroRequestDto,
    @Req() req: Request,
  ) {
    return await this.introRequestService.requestIntroduction(
      req.user.id,
      createIntroDto,
    );
  }

  @Get()
  async getPendingRequests(@Req() req: Request) {
    return await this.introRequestService.getPendingRequests(req.user.id);
  }

  @Get('requests')
  async getUserIntroRequests(@Req() req) {
    const userId = req.user.id; // Extract user ID from JWT
    const userType = req.user.userType; // Extract user type

    return this.introRequestService.getIntroRequestsForUser(userId, userType);
  }

  @Patch()
  async updateIntroRequest(
    @Body() updateIntroDto: UpdateIntroRequestDto,
    @Req() req: Request,
  ) {
    return await this.introRequestService.respondToIntroduction(
      updateIntroDto,
      req.user.id,
    );
  }
}
