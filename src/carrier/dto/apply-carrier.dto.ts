import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class ApplyCarrierDto {
  @ApiProperty({ example: 5, minimum: 0, maximum: 80 })
  @IsInt()
  @Min(0)
  @Max(80)
  experienceYears: number;

  @ApiProperty({ example: 'ROAD' })
  @Transform(trimString)
  @IsString()
  @MaxLength(50)
  transportType: string;

  @ApiProperty({
    example: 'Experienced regional truck carrier based in Aktau.',
    required: false,
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
