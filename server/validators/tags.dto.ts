import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateTagDto {
  @IsString()
  public name: string;
  @IsString()
  @IsOptional()
  public description: string;
  @IsOptional()
  @IsInt()
  public parentId: number;
}

export class TagIdDto {
  @IsInt()
  public id: number;
}

export class TagNameDto {
  @IsString()
  public name: string;
}
