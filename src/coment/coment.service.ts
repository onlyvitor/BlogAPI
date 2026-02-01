import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateComentDto } from './dto/create-coment.dto';
import { UpdateComentDto } from './dto/update-coment.dto';
import { Coment } from './entities/coment.entity';
import { PostService } from 'src/post/post.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ComentService {
  constructor(
    @InjectRepository(Coment) private readonly comentRepo: Repository<Coment>,
    private readonly postService: PostService,
  ) {}

  async create(
    createComentDto: CreateComentDto,
    postId: number,
    author?: User,
  ) {
    const post = await this.postService.findOne(postId);
    const coment = this.comentRepo.create({
      content: createComentDto.content,
      post,
      author,
    });
    return this.comentRepo.save(coment);
  }

  findAll() {
    return this.comentRepo.find({ relations: ['author', 'post'] });
  }

  async findOne(id: number) {
    const comment = await this.comentRepo.findOne({
      where: { id },
      relations: ['author', 'post'],
    });

    if (!comment) {
      throw new NotFoundException(`Coment with id ${id} not found`);
    }
    return comment;
  }

  async update(id: number, updateComentDto: UpdateComentDto, user: User) {
    const comment = await this.comentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Coment with id ${id} not found`);
    }

    if (comment.author?.id !== user.id) {
      throw new ForbiddenException('Você não é o autor deste comentário');
    }

    await this.comentRepo.update(id, updateComentDto);
    return { message: 'Coment updated successfully' };
  }

  async remove(id: number, user: User) {
    const comment = await this.comentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Coment with id ${id} not found`);
    }

    if (comment.author?.id !== user.id) {
      throw new ForbiddenException('Você não é o autor deste comentário');
    }

    await this.comentRepo.delete(id);
    return { message: 'Coment deleted successfully' };
  }
}
