import { IsString, IsDefined, IsDate } from "class-validator";
import { User } from "./";

export class SpotifyToken {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsString()
  accessToken!: string;

  @IsDefined()
  @IsString()
  refreshToken!: string;

  @IsDefined()
  @IsDate()
  expiration!: Date;

  @IsDefined()
  user!: User;

  @IsDefined()
  @IsString()
  userId!: string;
}
