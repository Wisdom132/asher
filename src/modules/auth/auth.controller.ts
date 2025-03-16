import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { HelperService } from 'src/utils/helpers';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly helperService: HelperService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const loginTrigger = await this.authService.login(loginDto);
    return this.helperService.sendObjectResponse(
      'Login successful',
      loginTrigger,
    );
  }
}
