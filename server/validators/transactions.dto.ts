import { Transform } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsDate, Validate } from 'class-validator';
import { ValidDate } from './validator';


export class TransactionIdDto {
  @IsInt()
  @Transform(({value}) => parseInt(value))
  public id: number
}


export class CreateTransactionDto {
  @IsOptional()
  @Validate(ValidDate)
  public created?: Date;
  @IsString()
  public description: string;
  @IsNumber()
  public amount: number;
  @IsNumber()
  public sourceId: number;
  @IsString()
  @IsOptional()
  public currency: string;
  @IsString()
  public tags: string[];
}

export class TagTransactionDto {
  @IsInt()
  public transactionId: number;
  @IsString()
  public tags: string;
}
  
