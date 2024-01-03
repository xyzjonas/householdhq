import { IsInt, IsOptional, IsString } from "class-validator";

export class LoginDto {
  @IsString()
  public username?: string;
  @IsString()
  public password?: string;
}
