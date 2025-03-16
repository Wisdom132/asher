/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  // OnModuleInit,
  // OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { Api } from 'telegram/tl';
import * as fs from 'fs';
import * as path from 'path';
import input from 'input';

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
  private readonly sessionFilePath = path.join(__dirname, '../../session.txt');
  private stringSession: StringSession;
  private readonly logger = new Logger(TelegramService.name);

  constructor(private readonly httpService: HttpService) {
    this.apiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;
    const sessionString = this.loadSession();
    this.stringSession = new StringSession(sessionString);
    this.client = new TelegramClient(
      new StringSession(sessionString),
      Number(process.env.TELEGRAM_API_ID),
      process.env.TELEGRAM_API_HASH,
      { connectionRetries: 5 },
    );
  }

  private loadSession(): string {
    try {
      if (fs.existsSync(this.sessionFilePath)) {
        return fs.readFileSync(this.sessionFilePath, 'utf-8');
      }
    } catch (error) {
      this.logger.error('Failed to load session', error);
    }
    return ''; // Return empty if no session exists
  }

  private saveSession(session: string) {
    try {
      fs.writeFileSync(this.sessionFilePath, session, 'utf-8');
      this.logger.log('Session saved successfully.');
    } catch (error) {
      this.logger.error('Failed to save session', error);
    }
  }
  async login(phoneNumber: string): Promise<string> {
    try {
      await this.client.start({
        // eslint-disable-next-line @typescript-eslint/require-await
        phoneNumber: async () => phoneNumber,
        phoneCode: async () =>
          await input.text('Enter the OTP sent to Telegram: '),
        onError: (err) => console.log('Error:', err),
      });

      // Ensure session is properly saved
      const sessionString =
        this.client.session instanceof StringSession
          ? this.client.session.save()
          : '';

      if (!sessionString) {
        throw new Error('Failed to generate session string');
      }

      this.saveSession(sessionString);
      return sessionString;
    } catch (error) {
      this.logger.error('Login failed', error);
      throw new Error('Login failed: ' + error.message);
    }
  }

  async connect(): Promise<void> {
    if (!this.client.connected) {
      await this.client.connect();
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.connect();
      return !!(await this.client.getMe());
    } catch (error) {
      return false;
    }
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
      throw new Error('Failed to retrieve messages', error.response?.data);
    }
  }
}
