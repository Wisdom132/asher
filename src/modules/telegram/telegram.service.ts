import { HttpService } from '@nestjs/axios';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';

interface TelegramCreateGroupResponse {
  result: { id: number };
}

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  from?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  chat?: {
    id: number;
    title?: string;
    type: string;
  };
}

interface TelegramGetMessagesResponse {
  result: TelegramMessage[];
}

@Injectable()
export class TelegramService {
  private readonly botToken: string;
  private readonly apiUrl: string;
  private client: TelegramClient;

  constructor(private readonly httpService: HttpService) {
    this.apiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    this.client = new TelegramClient(
      new StringSession(''), // Empty for now
      Number(process.env.TELEGRAM_API_ID), // Replace with your API ID
      process.env.TELEGRAM_API_HASH, // Replace with your API Hash
      { connectionRetries: 5 },
    );
  }

  async onModuleInit() {
    console.log('Connecting to Telegram MTProto API...');
    await this.client.connect();
    console.log('✅ Connected to Telegram');
  }

  async onModuleDestroy() {
    console.log('Disconnecting from Telegram MTProto API...');
    await this.client.disconnect();
    console.log('🚫 Disconnected from Telegram');
  }

  async validateHandle(handle: string): Promise<boolean> {
    try {
      const result = await this.client.invoke(
        new Api.contacts.ResolveUsername({ username: handle.replace('@', '') }),
      );
      console.log('User found:', result.users);
      return result.users.length > 0;
    } catch (error) {
      if (error.message.includes('USERNAME_NOT_OCCUPIED')) {
        console.log('❌ Username does NOT exist.');
        return false;
      }
      console.error('Error validating Telegram handle:', error);
      return false;
    }
  }

  async createGroup(title: string, userIds: number[]): Promise<number> {
    try {
      const response =
        await this.httpService.axiosRef.post<TelegramCreateGroupResponse>(
          `${this.apiUrl}/createChat`,
          {
            title,
            user_ids: userIds,
          },
        );
      return response.data?.result?.id;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error('Failed to create Telegram group', error.response?.data);
    }
  }

  async getMessages(chatId: number, limit: number = 10): Promise<any[]> {
    try {
      const response =
        await this.httpService.axiosRef.get<TelegramGetMessagesResponse>(
          `${this.apiUrl}/getUpdates`,
          {
            params: { chat_id: chatId, limit },
          },
        );
      return response.data.result;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error('Failed to retrieve messages', error.response?.data);
    }
  }
}
