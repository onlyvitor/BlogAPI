import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { statusPost } from '../post.status';
import { User } from 'src/user/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120 })
  title: string;

  @Column('text')
  content: string;

  @Column()
  type: 'enum';
  enum: statusPost;
  default: statusPost.DRAFT;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorID' })
  author: User;
  @CreateDateColumn()
  createdAt: Date;
}
