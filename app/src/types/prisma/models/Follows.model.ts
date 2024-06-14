import { IsString, IsDefined } from "class-validator";
import { User } from "./";

export class Follows {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  follower!: User;

  @IsDefined()
  @IsString()
  followerId!: string;

  @IsDefined()
  following!: User;

  @IsDefined()
  @IsString()
  followingId!: string;
}
