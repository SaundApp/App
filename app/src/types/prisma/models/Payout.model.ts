import {
  IsString,
  IsDefined,
  IsBoolean,
  IsDate,
  IsOptional,
} from "class-validator";
import { User, Subscription } from "./";

export class Payout {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  amount!: number;

  @IsDefined()
  @IsBoolean()
  paid!: boolean;

  @IsDefined()
  @IsDate()
  createdAt!: Date;

  @IsDefined()
  user!: User;

  @IsDefined()
  @IsString()
  userId!: string;

  @IsOptional()
  subscription?: Subscription;

  @IsOptional()
  @IsString()
  subscriptionId?: string;
}
