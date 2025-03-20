import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { CreateGroupDto } from './dtos/telegram.dto';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('validate-handle')
  async validateHandle(
    @Query('handle') handle: string,
  ): Promise<{ isValid: boolean }> {
    if (!handle?.trim()) {
      throw new BadRequestException('Telegram handle is required');
    }

    try {
      const { isValid } = await this.telegramService.validateHandle(
        handle.trim(),
      );
      return { isValid };
    } catch (error: any) {
      throw new InternalServerErrorException(
        'Error validating Telegram handle',
        error,
      );
    }
  }

  @Post('login')
  async login(@Body('phoneNumber') phoneNumber: string) {
    console.log(`Logging in with phone: ${phoneNumber}`);
    const session = await this.telegramService.login(phoneNumber);
    return { message: 'Logged in successfully', session };
  }

  @Get('status')
  async isLoggedIn() {
    const status = await this.telegramService.isLoggedIn();
    return { loggedIn: status };
  }

  @Post('add-to-group')
  async addUser(@Body() body: CreateGroupDto) {
    const { investorName, companyName, participantUsernames } = body;
    if (!investorName || !companyName || !Array.isArray(participantUsernames)) {
      throw new BadRequestException('Invalid request payload');
    }
    try {
      return await this.telegramService.createGroup(
        investorName,
        companyName,
        participantUsernames,
      );
    } catch (error) {
      throw new BadRequestException('Failed to create Telegram group', error);
    }
  }
}
