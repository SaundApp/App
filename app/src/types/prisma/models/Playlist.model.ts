import { IsString, IsDefined, IsDate, IsOptional } from "class-validator";
import { User, Comment } from "./";

export class Playlist {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsString()
  name!: string;

  @IsDefined()
  @IsDate()
  createdAt!: Date;

  @IsDefined()
  @IsString()
  image!: string;

  @IsDefined()
  @IsString()
  likes!: string[];

  @IsDefined()
  @IsString()
  url!: string;

  @IsDefined()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  spotifyId?: string;

  @IsDefined()
  user!: User;

  @IsDefined()
  comments!: Comment[];
}
