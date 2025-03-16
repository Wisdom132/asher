import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
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
}
