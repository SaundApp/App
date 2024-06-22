import { IsString, IsDefined, IsDate } from "class-validator";
import { Payout, User } from "./";

export class Subscription {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  @IsDate()
  createdAt!: Date;

  @IsDefined()
  amount!: number;

  @IsDefined()
  payout!: Payout[];

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
