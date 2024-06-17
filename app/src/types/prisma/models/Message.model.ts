import {
  IsString,
  IsDefined,
  IsBoolean,
  IsDate,
  IsOptional,
} from "class-validator";
import { User } from ".";

export class Message {
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
  sender!: User;

  @IsDefined()
  @IsString()
  senderId!: string;

  @IsDefined()
  receiver!: User;

  @IsDefined()
  @IsString()
  receiverId!: string;

  @IsOptional()
  @IsString()
  replyId?: string;
}
