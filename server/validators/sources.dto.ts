import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateSourceDto {
  @IsString()
  public name?: string;
}
