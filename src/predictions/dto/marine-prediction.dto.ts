import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Max, Min } from 'class-validator';

export class MarinePredictionRequestDto {
  @ApiProperty({ example: 43.65 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat: number;

  @ApiProperty({ example: 51.17 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng: number;

  @ApiProperty({ example: 40.37 })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  destLat: number;

  @ApiProperty({ example: 49.89 })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  destLng: number;
}

export class MarinePredictionResponseDto {
  @ApiProperty({ example: 'send' })
  recommendation: string;

  @ApiProperty({ example: 'low' })
  riskLevel: string;

  @ApiProperty({ example: '2026-06-12T08:00:00.000Z' })
  bestDepartureTime: string;

  @ApiProperty({ example: 0 })
  expectedDelayMinutes: number;

  @ApiProperty({ example: 'Морской маршрут свободен.' })
  shortExplanation: string;
}
