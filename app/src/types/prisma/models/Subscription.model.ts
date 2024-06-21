import { IsDefined, IsString } from "class-validator";
import { User } from ".";

export class Subscription {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  user!: User;

  @IsDefined()
  @IsString()
  userId!: string;

  @IsDefined()
  subscribedTo!: User;

  @IsDefined()
  @IsString()
  subscribedToId!: string;
}
