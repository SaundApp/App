import { IsString, IsDefined, IsDate, IsIn } from "class-validator";
import { User } from "./";
import { getEnumValues } from "../helpers";
import { AttachmentType } from "../enums";

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
