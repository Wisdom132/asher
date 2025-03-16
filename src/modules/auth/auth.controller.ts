import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { HelperService } from 'src/utils/helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly helperService: HelperService,
  ) {}

  @Post('verify-email')
  async verifyEmail(@Body() { email, otp }: { email: string; otp: string }) {
    const isVerified = await this.authService.verifyEmail(email, otp);
    if (!isVerified) throw new BadRequestException('Verification failed');

    return { message: 'Email verified successfully' };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const loginTrigger = await this.authService.login(loginDto);
    return this.helperService.sendObjectResponse(
      'Login successful',
      loginTrigger,
    );
  }
}
