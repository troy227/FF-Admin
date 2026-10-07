import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IsBoolean } from "class-validator";

export class CreateFlagDto {
    @IsString()
    @IsNotEmpty()
    key: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    userIds?: number[] | null;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}

export class UpdateFlagDto {
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    userIds?: number[] | null;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    key?: string;
}