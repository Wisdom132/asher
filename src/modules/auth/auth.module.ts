import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { HelperService } from 'src/utils/helpers';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey',
      signOptions: { expiresIn: '6h' },
    }),
  ],
  providers: [AuthService, PrismaService, HelperService],
  controllers: [AuthController],
})
export class AuthModule {}
