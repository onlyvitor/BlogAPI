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
  create(@Body() createPostDto: CreatePostDto, @Req() req: express.Request) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookies = req.cookies['jwt'];
    if (!cookies) {
      throw new UnauthorizedException('Unauthorized');
    }
    return this.postService.create(createPostDto);
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
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }
}
