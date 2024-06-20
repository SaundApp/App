import { IsDate, IsDefined, IsInt, IsString } from "class-validator";
import { User } from ".";

export class Listener {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsInt()
  count!: number;

  @IsDefined()
  @IsDate()
  updatedAt!: Date;

  @IsDefined()
  artist!: User;

  @IsDefined()
  @IsString()
  artistId!: string;

  @IsDefined()
  listener!: User;

  @IsDefined()
  @IsString()
  listenerId!: string;
}
