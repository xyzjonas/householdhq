import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { ValidDate } from './validator';


export class CreateSourceDto {
  @IsString()
  public name?: string;

  @IsBoolean()
  @IsOptional()
  public isOut?: boolean


  @IsBoolean()
  @IsOptional()
  public isDisponible?: boolean

}

export class EditSourceDto {
    @IsInt()
    @Transform(({value}) => parseInt(value))
    public id?: number

    @IsBoolean()
    @IsOptional()
    public isOut?: boolean

    @IsBoolean()
    @IsOptional()
    public isDisponible?: boolean

    @IsOptional()
    @IsString()
    public name?: string;

    @IsOptional()
    @IsString()
    public color?: string;
  }

export class UpdateSourceStateDto {
  @IsInt()
  @Transform(({value}) => parseInt(value))
  public sourceId?: number

  @IsNumber()
  public amount?: number;
  

  @IsOptional()
  @Validate(ValidDate)
  @Transform(({value}) => new Date(value))
  public created?: Date;

}
