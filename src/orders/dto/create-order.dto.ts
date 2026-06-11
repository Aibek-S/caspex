import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateOrderDto {
  @ApiProperty({ example: 'Transport construction materials to Kuryk' })
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'CONSTRUCTION_MATERIALS' })
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  cargoType: string;

  @ApiProperty({ example: 12.5, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  weight: number;

  @ApiProperty({ example: 42, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  volume: number;

  @ApiProperty({ example: 'Aktau' })
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  origin: string;

  @ApiProperty({ example: 'Kuryk Port' })
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  destination: string;

  @ApiProperty({ example: 'Requires covered truck', required: false })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiProperty({ example: 180000, minimum: 0, required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

  @ApiProperty({
    example: 8,
    minimum: 0,
    maximum: 100000,
    required: false,
    description: 'Estimated delivery time in hours',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  estimatedDeliveryTime?: number;

  @ApiProperty({
    example: 120,
    minimum: 0,
    maximum: 100000,
    required: false,
    description: 'Estimated carrier search time in minutes',
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  estimatedCarrierSearchTime?: number;
}
