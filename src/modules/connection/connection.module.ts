import { Module } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';
import { ConnectionRepository } from './repositories/connection.repository';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
@Module({
  imports: [
    UserModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'yourSecretKey',
      signOptions: { expiresIn: '6h' },
    }),
  ],
  providers: [ConnectionService, ConnectionRepository],
  controllers: [ConnectionController],
  exports: [ConnectionService, ConnectionRepository],
})
export class ConnectionModule {}
