import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ComentService } from './coment.service';
import { CreateComentDto } from './dto/create-coment.dto';
import { UpdateComentDto } from './dto/update-coment.dto';
import { AuthService } from 'src/auth/auth.service';
import * as express from 'express';

@Controller('comment')
export class ComentController {
  constructor(
    private readonly comentService: ComentService,
    private readonly authService: AuthService,
  ) {}

  @Post(':id')
  async create(
    @Param('id') id: string,
    @Body() createComentDto: CreateComentDto,
    @Req() req: express.Request,
  ) {
    const token = req.cookies?.['jwt'];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.authService.getUserFromToken(token);
    return this.comentService.create(createComentDto, +id, user);
  }

  @Get()
  async findAll(@Req() req: express.Request) {
    const token = req.cookies?.['jwt'];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.comentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: express.Request) {
    const token = req.cookies?.['jwt'];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.comentService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateComentDto: UpdateComentDto,
    @Req() req: express.Request,
  ) {
    const token = req.cookies?.['jwt'];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.authService.getUserFromToken(token);
    return this.comentService.update(+id, updateComentDto, user);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: express.Request) {
    const token = req.cookies?.['jwt'];
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.authService.getUserFromToken(token);
    return this.comentService.remove(+id, user);
  }
}
