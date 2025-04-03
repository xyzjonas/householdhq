import { Transform } from "class-transformer";
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsDate,
  Validate,
  IsBoolean,
} from "class-validator";
import { ValidArray, ValidDate } from "./validator";


function parseBool(val: string) {
  if (val === "true" || val === "1" || val === "True") {
    return true
  }
  return false
}

export class TransactionMonthDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  public month?: number;
  
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  public year?: number;
}

export class TransactionFiltersDto {
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  public categoryId?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => parseBool(value))
  public important?: boolean;
}

export class CreateTransactionDto {
  @IsOptional()
  @Validate(ValidDate)
  @Transform(({ value }) => new Date(value))
  public transactedAt?: Date;

  @IsString()
  public description?: string;

  @IsNumber()
  public amount?: number;

  @IsOptional()
  @IsNumber()
  public recurring?: number;

  @IsOptional()
  @IsNumber()
  public categoryId?: number;

  @IsNumber()
  public sourceId?: number;

  @IsNumber()
  public targetId?: number;

  @IsOptional()
  @IsNumber()
  public projectId?: number;

  @IsString()
  @IsOptional()
  public currency?: string;

  @IsOptional()
  @Validate(ValidArray)
  @Transform(({ value }) => value.split(","))
  public tags?: string[];

  @IsBoolean()
  @IsOptional()
  public isImportant?: boolean;

  @IsBoolean()
  @IsOptional()
  public isHidden?: boolean;
}

export class EditTransactionDto {
  @IsNumber()
  public id?: number;

  @IsOptional()
  @Validate(ValidDate)
  @Transform(({ value }) => new Date(value))
  public transactedAt?: Date;

  @IsOptional()
  @IsBoolean()
  public cancelled?: boolean;

  @IsOptional()
  @IsBoolean()
  public confirmed?: boolean;

  @IsOptional()
  @IsString()
  public description?: string;

  @IsOptional()
  @IsNumber()
  public amount?: number;

  @IsOptional()
  @IsNumber()
  public recurring?: number;

  @IsOptional()
  @IsNumber()
  public categoryId?: number;

  @IsOptional()
  @IsNumber()
  public sourceId?: number;

  @IsOptional()
  @IsNumber()
  public targetId?: number;

  @IsOptional()
  @IsNumber()
  public projectId?: number;

  @IsString()
  @IsOptional()
  public currency?: string;

  @IsOptional()
  @Validate(ValidArray)
  @Transform(({ value }) => value.split(","))
  public tags?: string[];

  @IsBoolean()
  @IsOptional()
  public isImportant?: boolean;

  @IsBoolean()
  @IsOptional()
  public isHidden?: boolean;
}

export class TagTransactionDto {
  @IsInt()
  public transactionId?: number;

  @Validate(ValidArray)
  @Transform(({ value }) => value.split(","))
  public tags?: string[];
}
