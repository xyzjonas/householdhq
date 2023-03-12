import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsDate, Validate } from 'class-validator';
import { ValidArray, ValidDate } from './validator';


export class IdDto {
  @IsInt()
  @Transform(({value}) => parseInt(value))
  public id?: number
}


export class TransactionMonthDto {
  @IsInt()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  public month?: number
  @IsInt()
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  public year?: number
}

export class CreateTransactionDto {
  @IsOptional()
  @Validate(ValidDate)
  @Transform(({value}) => new Date(value))
  public created?: Date;
  
  @IsString()
  public description?: string;
  
  @IsNumber()
  public amount?: number;
  
  @IsNumber()
  public sourceId?: number;
  
  @IsString()
  @IsOptional()
  public currency?: string;

  @Validate(ValidArray)
  @Transform(({value}) => value.split(','))
  public tags?: string[];
}

export class EditTransactionDto {
  @IsNumber()
  public id?: number;

  @IsOptional()
  @Validate(ValidDate)
  @Transform(({value}) => new Date(value))
  public created?: Date;
  
  @IsOptional()
  @Validate(ValidDate)
  @Transform(({value}) => new Date(value))
  public cancelled?: Date;

  @IsOptional()
  @Validate(ValidDate)
  @Transform(({value}) => new Date(value))
  public confirmed?: Date;

  @IsOptional()
  @IsString()
  public description?: string;
  
  @IsOptional()
  @IsNumber()
  public amount?: number;
  
  @IsOptional()
  @IsNumber()
  public sourceId?: number;
  
  @IsString()
  @IsOptional()
  public currency?: string;

  @IsOptional()
  @Validate(ValidArray)
  @Transform(({value}) => value.split(','))
  public tags?: string[];
}

export class TagTransactionDto {
  @IsInt()
  public transactionId?: number;

  @Validate(ValidArray)
  @Transform(({value}) => value.split(','))
  public tags?: string[];
}
  
