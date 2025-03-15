import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto, UpdateUserDto } from './dto';
import { IUser } from './interfaces/user.interface';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userDto: CreateUserDto) {
    const existingUser = await this.userRepository.findUserByEmail(
      userDto.email,
    );
    if (existingUser) throw new ConflictException('Email already exists');

    return this.userRepository.createUser(userDto);
  }
  async getUsers(): Promise<IUser[]> {
    return this.userRepository.getUsers();
  }

  async getUserById(id: string): Promise<IUser> {
    const user = await this.userRepository.findUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto): Promise<IUser> {
    return this.userRepository.updateUser(id, dto);
  }

  async deleteUser(id: string): Promise<IUser> {
    return this.userRepository.deleteUser(id);
  }
}
