import { IsString, IsDefined, IsDate, IsOptional } from "class-validator";
import { User, Post, Playlist } from "./";

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
  playlist?: Playlist;

  @IsOptional()
  @IsString()
  playlistId?: string;
}
