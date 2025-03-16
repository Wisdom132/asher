import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { HelperService } from 'src/utils/helpers';
import { TelegramModule } from '../telegram/telegram.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TelegramModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserService, UserRepository, HelperService],
  controllers: [UserController],
})
export class UserModule {}
