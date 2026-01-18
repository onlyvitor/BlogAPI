import { Module } from '@nestjs/common';
import { ComentService } from './coment.service';
import { ComentController } from './coment.controller';

@Module({
  controllers: [ComentController],
  providers: [ComentService],
})
export class ComentModule {}
