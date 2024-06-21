import { IsDefined, IsNumber, IsString } from "class-validator";

export class SubscriptionSettings {
  @IsDefined()
  @IsString()
  perks!: string[];

  @IsDefined()
  @IsNumber()
  price!: number;
}
