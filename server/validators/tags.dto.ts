import { IsInt, IsOptional, IsString } from 'class-validator';

export class TagDto {
  @IsString()
  public name: string;
  @IsString()
  @IsOptional()
  public description: string;
  @IsString()
  @IsOptional()
  public icon: string;
  @IsString()
  @IsOptional()
  public color: string;
  @IsOptional()
  @IsInt()
  public parentId: number;
}

export class EditTagDto {
  @IsInt()
  public id: number;
  @IsOptional()
  @IsString()
  public name?: string;
  @IsString()
  @IsOptional()
  public description?: string;
  @IsString()
  @IsOptional()
  public icon?: string;
  @IsString()
  @IsOptional()
  public color?: string;
  @IsOptional()
  @IsInt()
  public parentId?: number;
}
