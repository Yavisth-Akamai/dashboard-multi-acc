import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginDto {
  User: string;
  password: string;
}

interface ChangePasswordDto {
  User: string;
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.User, body.password);
  }

  @Post('change-password')
  async changePassword(@Body() body: ChangePasswordDto) {
    return this.authService.changePassword(body.User, body.newPassword);
  }
}
