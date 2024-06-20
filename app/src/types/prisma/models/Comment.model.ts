import { IsDate, IsDefined, IsOptional, IsString } from "class-validator";
import { Post, User } from ".";

export class Comment {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsString()
  text!: string;

  @IsDefined()
  @IsDate()
  createdAt!: Date;

  @IsDefined()
  @IsString()
  likes!: string[];

  @IsDefined()
  @IsString()
  userId!: string;

  @IsDefined()
  @IsString()
  postId!: string;

  @IsDefined()
  user!: User;

  @IsDefined()
  post!: Post;

  @IsOptional()
  @IsString()
  playlistId?: string;
}
