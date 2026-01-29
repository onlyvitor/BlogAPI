import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
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
    const token = req.cookies['jwt'];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = await this.authService.verifyToken(token);
    const user = await this.authService.getUserFromToken(token);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { user, data };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: express.Response) {
    return this.authService.signOut(res);
  }
}
