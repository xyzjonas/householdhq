import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Validate, ValidatorConstraint, type ValidationArguments, type ValidatorConstraintInterface } from 'class-validator';
import { ValidDate } from './validator';


@ValidatorConstraint({ name: 'sourceType', async: false })
export class SourceTypeValidation implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return ["ACCOUNT", "OUT", "CASH", "SAVINGS", "INVESTMENT", "DEBT"].includes(value)
  }

  defaultMessage(args: ValidationArguments) {
    return 'Type $value is not a valid source type!';
  }
}


export class CreateSourceDto {
  @IsString()
  public name?: string;

  @IsBoolean()
  @IsOptional()
  public isOut?: boolean

  @IsBoolean()
  @IsOptional()
  public isDisponible?: boolean

  @IsBoolean()
  @IsOptional()
  public isPortfolio?: boolean

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

    @IsBoolean()
    @IsOptional()
    public isPortfolio?: boolean

    @IsOptional()
    @IsString()
    public name?: string;

    @IsOptional()
    @IsString()
    public color?: string;

    @IsInt()
    @IsOptional()
    @Transform(({value}) => parseInt(value))
    public position?: number


    @IsOptional()
    @Validate(SourceTypeValidation)
    public type?: string
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
