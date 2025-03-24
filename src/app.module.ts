import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { HelperService } from './utils/helpers';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TelegramModule } from './modules/telegram/telegram.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConnectionModule } from './modules/connection/connection.module';
import { TelegramChatRequestModule } from './modules/telegram-chat-request/telegram-chat-request.module';
import { IntroRequestModule } from './modules/intro-request/intro-request.module';
import { InChatModule } from './modules/in-chat/in-chat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule,
    PrismaModule,
    UserModule,
    AuthModule,
    TelegramModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey',
      signOptions: { expiresIn: '7d' },
    }),
    ConnectionModule,
    TelegramChatRequestModule,
    IntroRequestModule,
    InChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelperService, JwtStrategy],
})
export class AppModule {}
