import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { statusPost } from './post.status';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
  ) {}
  create(createPostDto: CreatePostDto, author?: User) {
    const post = this.postRepo.create({
      title: createPostDto.title,
      content: createPostDto.content,
      author,
    });

    return this.postRepo.save(post);
  }

  findAll() {
    return this.postRepo.find({
      where: { status: statusPost.PUBLISHED },
    });
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({
      where: { id, status: statusPost.PUBLISHED },
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto, userId: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    if (!post.author || post.author.id != userId) {
      throw new ForbiddenException('Você não é o autor deste post');
    }
    Object.assign(post, updatePostDto);
    return this.postRepo.save(post);
  }

  async remove(id: number, userId: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    if (!post.author || post.author.id != userId) {
      throw new ForbiddenException('Você não é o autor deste post');
    }

    return this.postRepo.remove(post);
  }
}
