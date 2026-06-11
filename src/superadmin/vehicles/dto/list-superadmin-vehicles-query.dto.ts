import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const toNumber = ({ value }: TransformFnParams): unknown => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  return Number(value);
};

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ListSuperadminVehiclesQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @Transform(toNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 25, minimum: 1, maximum: 100 })
  @Transform(toNumber)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ example: 'cmmi83qoc00000kirq90user' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  carrierId?: string;

  @ApiPropertyOptional({ example: 'TRUCK' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiPropertyOptional({ example: 'Volvo' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  brand?: string;

  @ApiPropertyOptional({ example: '123ABC12' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(30)
  plateNumber?: string;

  @ApiPropertyOptional({ example: 'aktau' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
