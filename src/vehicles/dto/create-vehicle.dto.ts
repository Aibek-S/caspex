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

export class CreateVehicleDto {
  @ApiProperty({ example: 'TRUCK' })
  @Transform(trimString)
  @IsString()
  @MaxLength(50)
  type: string;

  @ApiProperty({ example: 'Volvo' })
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  brand: string;

  @ApiProperty({ example: 'FH16' })
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  model: string;

  @ApiProperty({ example: 2021, minimum: 1950, maximum: 2100 })
  @Type(() => Number)
  @IsInt()
  @Min(1950)
  @Max(2100)
  year: number;

  @ApiProperty({ example: '123ABC12' })
  @Transform(trimString)
  @IsString()
  @MaxLength(30)
  plateNumber: string;

  @ApiProperty({ example: 20, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  capacityTons: number;

  @ApiProperty({ example: 86, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cargoVolume: number;

  @ApiProperty({ example: 'https://example.com/vehicle.jpg', required: false })
  @Transform(trimString)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  vehicleImageUrl?: string;
}
