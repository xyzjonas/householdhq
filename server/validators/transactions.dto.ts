import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsDate, Validate } from 'class-validator';
import { ValidArray, ValidDate } from './validator';


export class TransactionIdDto {
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

export class TagTransactionDto {
  @IsInt()
  public transactionId?: number;

  @Validate(ValidArray)
  @Transform(({value}) => value.split(','))
  public tags?: string[];
}
  
