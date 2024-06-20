import {
  IsBoolean,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
} from "class-validator";
import { Attachment, Comment, Follows, Message, Post, SpotifyToken } from ".";

export class User {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsString()
  username!: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsDefined()
  @IsString()
  name!: string;

  @IsDefined()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  avatarId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsDefined()
  @IsBoolean()
  private!: boolean;

  @IsOptional()
  @IsInt()
  streams?: number;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsDefined()
  @IsString()
  genres!: string[];

  @IsOptional()
  @IsString()
  spotifyId?: string;

  @IsDefined()
  followers!: Follows[];

  @IsDefined()
  following!: Follows[];

  @IsDefined()
  posts!: Post[];

  @IsDefined()
  comments!: Comment[];

  @IsDefined()
  messagesSent!: Message[];

  @IsDefined()
  messagesReceived!: Message[];

  @IsDefined()
  attachments!: Attachment[];

  @IsOptional()
  spotifyToken?: SpotifyToken;
}
