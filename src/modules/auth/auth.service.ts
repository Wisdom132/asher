import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { HelperService } from 'src/utils/helpers';
import { UserRepository } from '../user/repositories/user.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
    private readonly userRepository: UserRepository,
  ) {}

  async verifyEmail(email: string, otp: string): Promise<boolean> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) throw new BadRequestException('User not found');

    if (user.emailVerified)
      throw new BadRequestException('Email already verified');

    if (user.verifyEmailCode !== otp)
      throw new BadRequestException('Invalid OTP');

    await this.userRepository.updateUser(user.id, {
      verifyEmailCode: null,
      emailVerified: true,
    });
    return true;
  }

  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const token = await this.helperService.generateToken(user);

    return { token, user };
  }
}
