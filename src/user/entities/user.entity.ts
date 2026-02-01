import { Post } from 'src/post/entities/post.entity';
import { Coment } from 'src/coment/entities/coment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 120, unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Coment, (coment) => coment.author)
  coments: Coment[];

  @CreateDateColumn()
  createdAt: Date;
}
