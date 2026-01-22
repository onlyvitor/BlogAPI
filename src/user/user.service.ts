import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.userRepo.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (userExists) {
      throw new BadRequestException('User alredy exists');
    }

    const passwordHash = await hash(createUserDto.password, 10);

    const user = this.userRepo.create({
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash,
    });

    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.preload({ id, ...updateUserDto });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.userRepo.save(user);
  }
  async remove(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.userRepo.delete(id);
  }
}
