import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signIn(loginDto: LoginDto, res: Response) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!(await bcrypt.compare(loginDto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const jwt = await this.jwtService.signAsync({ id: user.id });
    res.cookie('jwt', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return { message: 'Successfully logged in' };
  }
}
