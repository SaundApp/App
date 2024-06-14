import { IsString, IsDefined } from "class-validator";
import { Post } from "./";

export class SocialUrl {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsString()
  spotify!: string;

  @IsDefined()
  @IsString()
  amazon!: string;

  @IsDefined()
  @IsString()
  apple!: string;

  @IsDefined()
  posts!: Post[];
}
