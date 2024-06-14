import { IsString, IsDefined, IsDate, IsIn } from "class-validator";
import { User, SocialUrl, Comment } from "./";
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
  urlId!: string;

  @IsDefined()
  @IsIn(getEnumValues(PostType))
  type!: PostType;

  @IsDefined()
  user!: User;

  @IsDefined()
  urls!: SocialUrl;

  @IsDefined()
  comments!: Comment[];
}
