import { Module, forwardRef } from '@nestjs/common';
import { ComentService } from './coment.service';
import { ComentController } from './coment.controller';
import { PostModule } from 'src/post/post.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coment } from './entities/coment.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ComentController],
  providers: [ComentService],
  imports: [
    forwardRef(() => PostModule),
    TypeOrmModule.forFeature([Coment]),
    forwardRef(() => AuthModule),
  ],
})
export class ComentModule {}
