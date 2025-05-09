import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

//   @Post('signup')
//   async signup(@Body() body: { email: string; password: string }) {
//     await this.authService.signup(body.email, body.password);
//     return { message: 'Signup successful' };
//   }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
