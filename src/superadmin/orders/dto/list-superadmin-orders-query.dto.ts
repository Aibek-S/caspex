import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEnum,
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

export class ListSuperadminOrdersQueryDto {
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

  @ApiPropertyOptional({ example: 'cmmi83qoc00000kirq90usr' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  clientId?: string;

  @ApiPropertyOptional({ example: 'cmmi83qoc00000kirq90car' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  carrierId?: string;

  @ApiPropertyOptional({ enum: OrderStatus, example: OrderStatus.NEW })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'CONSTRUCTION_MATERIALS' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  cargoType?: string;

  @ApiPropertyOptional({ example: 'aktau' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
