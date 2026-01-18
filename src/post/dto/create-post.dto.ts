import { IsString } from 'class-validator';

export class CreatePostDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @IsString()
  content: string;
}
