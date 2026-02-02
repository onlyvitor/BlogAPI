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
    const coment = await this.comentRepo.findOne({
      where: { id },
      relations: ['author', 'post'],
    });

    if (!coment) {
      throw new NotFoundException(`Coment with id ${id} not found`);
    }
    return coment;
  }

  async update(id: number, updateComentDto: UpdateComentDto, user: User) {
    const coment = await this.comentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!coment) {
      throw new NotFoundException(`Coment with id ${id} not found`);
    }

    if (coment.author?.id !== user.id) {
      throw new ForbiddenException('Você não é o autor deste comentário');
    }

    await this.comentRepo.update(id, updateComentDto);
    return { message: 'Coment updated successfully' };
  }

  async remove(id: number, user: User) {
    const coment = await this.comentRepo.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!coment) {
      throw new NotFoundException(`Coment with id ${id} not found`);
    }

    if (coment.author?.id !== user.id) {
      throw new ForbiddenException('Você não é o autor deste comentário');
    }

    await this.comentRepo.delete(id);
    return { message: 'Coment deleted successfully' };
  }
}
