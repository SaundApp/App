import {
  IsString,
  IsDefined,
  IsOptional,
  IsBoolean,
  IsInt,
} from "class-validator";
import {
  Listener,
  Follows,
  Post,
  Comment,
  Message,
  Subscription,
  Notification,
  Attachment,
  SpotifyToken,
  SubscriptionSettings,
} from "./";

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

  @IsOptional()
  @IsString()
  stripeId?: string;

  @IsOptional()
  @IsString()
  stripeCustomerId?: string;

  @IsOptional()
  @IsString()
  notificationToken?: string;

  @IsDefined()
  @IsBoolean()
  verified!: boolean;

  @IsOptional()
  subscriptionSettings?: SubscriptionSettings;

  @IsDefined()
  listeners!: Listener[];

  @IsDefined()
  listenerOf!: Listener[];

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
  subscriptions!: Subscription[];

  @IsDefined()
  subscribers!: Subscription[];

  @IsDefined()
  notifications!: Notification[];

  @IsDefined()
  attachments!: Attachment[];

  @IsOptional()
  spotifyToken?: SpotifyToken;
}
