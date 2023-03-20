import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';


export class IdDto {
    @IsInt()
    @Transform(({value}) => parseInt(value))
    public id?: number
  }

export class CreateSourceDto {
  @IsString()
  public name?: string;

  @IsBoolean()
  @IsOptional()
  public isOut?: boolean

}

export class EditSourceDto {

    @IsInt()
    @Transform(({value}) => parseInt(value))
    public id?: number

    @IsBoolean()
    @IsOptional()
    public isOut?: boolean

    @IsOptional()
    @IsString()
    public name?: string;
  }
