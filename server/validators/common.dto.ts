import { Transform } from "class-transformer";
import { IsInt, IsString } from "class-validator";

export class IdDto {
    @IsInt()
    @Transform(({value}) => parseInt(value))
    public id?: number
}

export class NameDto {
    @IsString()
    public name?: string;
}