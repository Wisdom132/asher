import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repositories/user.repository';
import { HelperService } from 'src/utils/helpers';
@Module({
  providers: [UserService, UserRepository, HelperService],
  controllers: [UserController],
})
export class UserModule {}
