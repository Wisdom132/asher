/* eslint-disable @typescript-eslint/no-unused-vars */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUser } from '../interfaces/user.interface';
import { HelperService } from '../../../utils/helpers';
import { TelegramService } from '../../telegram/telegram.service';
import { UserType } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly telegramService: TelegramService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<IUser> {
    const { isValid } = await this.telegramService.validateHandle(
      userData.telegramHandle,
    );

    if (!isValid)
      throw new BadRequestException(
        'Invalid Telegram handle. Please provide a valid username.',
      );
    const hashedPassword = await this.helperService.hashPassword(
      userData.password,
    );
    const emailOtp = this.helperService.generateOTP();

    const { password, ...filteredUserData } = userData;

    return this.prisma.user.create({
      data: {
        ...filteredUserData,
        passwordHash: hashedPassword,
        verifyEmailCode: emailOtp,
      },
    });
    // .then(async (user) => {
    //   await this.helperService.sendEmailVerification(
    //     { email: userData.email, name: userData.name },
    //     `your otp is ${emailOtp}`,
    //   );
    //   return user;
    // });
  }

  async getUsersByType(userType: UserType) {
    return this.prisma.user.findMany({
      where: { userType },
    });
  }

  async getUsers(): Promise<IUser[]> {
    return this.prisma.user.findMany();
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<IUser | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: Partial<IUser>): Promise<IUser> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string): Promise<IUser> {
    return this.prisma.user.delete({ where: { id } });
  }
}
