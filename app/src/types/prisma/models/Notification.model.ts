import { IsString, IsDefined, IsBoolean, IsDate } from "class-validator";
import { User } from "./";

export class Notification {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsString()
  text!: string;

  @IsDefined()
  @IsBoolean()
  read!: boolean;

  @IsDefined()
  @IsDate()
  createdAt!: Date;

  @IsDefined()
  user!: User;

  @IsDefined()
  @IsString()
  userId!: string;
}
