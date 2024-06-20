import { IsDate, IsDefined, IsIn, IsString } from "class-validator";
import { User } from ".";
import { AttachmentType } from "../enums";
import { getEnumValues } from "../helpers";

export class Attachment {
  @IsDefined()
  @IsString()
  id!: string;

  @IsDefined()
  data!: Buffer;

  @IsDefined()
  @IsString()
  name!: string;

  @IsDefined()
  @IsString()
  userId!: string;

  @IsDefined()
  @IsDate()
  createdAt!: Date;

  @IsDefined()
  @IsIn(getEnumValues(AttachmentType))
  type!: AttachmentType;

  @IsDefined()
  user!: User;
}
