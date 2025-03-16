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
      signOptions: { expiresIn: '1h' },
    }),
    ConnectionModule,
  ],
  controllers: [AppController],
  providers: [AppService, HelperService, JwtStrategy],
})
export class AppModule {}
