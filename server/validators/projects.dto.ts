import {
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString
} from "class-validator";

export class CreateProjectDto {
  @IsString()
  public name?: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsString()
  @IsOptional()
  public color?: string;

  //   @IsOptional()
  //   @Validate(ValidDate)
  //   @Transform(({ value }) => new Date(value))
  //   public created?: Date;

  @IsNumber()
  public estimate?: number;
}

export class EditProjectDto {
  @IsInt()
  public id?: number;

  @IsString()
  @IsOptional()
  public name?: string;

  @IsString()
  @IsOptional()
  public description?: string;

  @IsOptional()
  @IsNumber()
  public estimate?: number;

  @IsOptional()
  @IsBoolean()
  public isCompleted?: boolean;

  @IsString()
  @IsOptional()
  public color?: string;
}
