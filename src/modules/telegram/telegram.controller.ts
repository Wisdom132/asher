import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { TelegramService } from './telegram.service';

@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Get('validate-handle')
  async validateHandle(
    @Query('handle') handle: string,
  ): Promise<{ isValid: boolean }> {
    if (!handle) {
      throw new BadRequestException('Telegram handle is required');
    }

    const isValid = await this.telegramService.validateHandle(handle);
    return { isValid };
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
}
