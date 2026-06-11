import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateOrderTrackingDto {
  @ApiProperty({ enum: OrderStatus, example: OrderStatus.IN_TRANSIT })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({ example: 'Aktau, Microdistrict 15' })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    example: '2026-06-11T12:30:00.000Z',
    description: 'Optional event timestamp, defaults to current time',
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  timestamp?: Date;
}
