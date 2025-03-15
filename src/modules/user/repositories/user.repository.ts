/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { IUser } from '../interfaces/user.interface';
import { HelperService } from '../../../utils/helpers';
@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    public helperService: HelperService,
  ) {}

  async createUser(userData: CreateUserDto): Promise<IUser> {
    const hashedPassword = await this.helperService.hashPassword(
      userData.password,
    );

    const { password, ...filteredUserData } = userData; // ✅ Exclude password

    return this.prisma.user.create({
      data: { ...filteredUserData, passwordHash: hashedPassword },
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
