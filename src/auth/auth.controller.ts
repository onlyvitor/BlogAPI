import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: express.Response,
  ) {
    return this.authService.signIn(loginDto, res);
  }

  @Get('profile')
  async getProfile(@Req() req: express.Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookies = req.cookies['jwt'];
    const data = this.authService.verifyToken(cookies);
    const user = await this.authService.getUserFromToken(cookies);
    return { user, data: data };
  }
}
