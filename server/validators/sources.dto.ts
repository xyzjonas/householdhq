import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';


export class IdDto {
    @IsInt()
    @Transform(({value}) => parseInt(value))
    public id?: number
  }

export class CreateSourceDto {
  @IsString()
  public name?: string;
}

export class EditSourceDto {

    @IsInt()
    @Transform(({value}) => parseInt(value))
    public id?: number

    @IsOptional()
    @IsString()
    public name?: string;
  }
