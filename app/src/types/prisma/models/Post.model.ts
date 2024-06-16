import { IsString, IsDefined, IsDate, IsInt, IsIn } from "class-validator";
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
  userId!: string;

  @IsDefined()
  @IsString()
  url!: string;

  @IsDefined()
  @IsInt()
  streams!: number;

  @IsDefined()
  @IsIn(getEnumValues(PostType))
  type!: PostType;

  @IsDefined()
  user!: User;

  @IsDefined()
  comments!: Comment[];
}
