import { IsInt, IsOptional, IsString } from "class-validator";

export class CategoryDto {
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

export class EditCategoryDto {
  @IsInt()
  public id?: number;
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
