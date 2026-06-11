import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsEnum,
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

export class UpdateSuperadminOrderDto {
  @ApiPropertyOptional({ example: 'Transport construction materials to Kuryk' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'CONSTRUCTION_MATERIALS' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargoType?: string;

  @ApiPropertyOptional({ example: 12.5, minimum: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ example: 42, minimum: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  volume?: number;

  @ApiPropertyOptional({ example: 'Aktau' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  origin?: string;

  @ApiPropertyOptional({ example: 'Kuryk Port' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  destination?: string;

  @ApiPropertyOptional({ example: 'Requires covered truck' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({ example: 180000, minimum: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

  @ApiPropertyOptional({ example: 8, minimum: 0, maximum: 100000 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  estimatedDeliveryTime?: number;

  @ApiPropertyOptional({ example: 120, minimum: 0, maximum: 100000 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100000)
  estimatedCarrierSearchTime?: number;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.ASSIGNED })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    example: 'cmmi83qoc00000kirq90car',
    nullable: true,
  })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  carrierId?: string | null;
}
