import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthService } from 'src/auth/auth.service';
import * as express from 'express';
import { UnauthorizedException } from '@nestjs/common';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(
    @Body() createPostDto: CreatePostDto,
    @Req() req: express.Request,
  ) {
    const token = String(req.cookies['jwt']);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    const user = await this.authService.getUserFromToken(token);
    return this.postService.create(createPostDto, user);
  }

  @Get()
  findAll() {
    return this.postService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req: express.Request,
  ) {
    const token = String(req.cookies['jwt']);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    const userId = this.authService.getUserIdFromToken(token);
    return await this.postService.update(+id, updatePostDto, await userId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: express.Request) {
    const token = String(req.cookies['jwt']);
    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }
    const isLoggedIn = await this.authService.isLoggedIn(token);
    if (!isLoggedIn) {
      throw new UnauthorizedException('Unauthorized');
    }
    const userId = this.authService.getUserIdFromToken(token);
    return await this.postService.remove(+id, await userId);
  }
}
