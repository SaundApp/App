import { IsString, IsDefined, IsDate, IsIn } from "class-validator";
import { User, Comment } from "./";
import { getEnumValues } from "../helpers";
import { PostType } from "../enums";

export class Post {
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
  seen!: string[];

  @IsDefined()
  @IsString()
  genres!: string[];

  @IsDefined()
  @IsString()
  userId!: string;

  @IsDefined()
  @IsString()
  url!: string;

  @IsDefined()
  @IsIn(getEnumValues(PostType))
  type!: PostType;

  @IsDefined()
  @IsString()
  spotifyId!: string;

  @IsDefined()
  user!: User;

  @IsDefined()
  comments!: Comment[];
}
