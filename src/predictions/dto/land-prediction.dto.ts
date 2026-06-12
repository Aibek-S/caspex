import { ApiProperty } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsString, MaxLength } from 'class-validator';

const trimString = ({ value }: TransformFnParams): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class LandPredictionRequestDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90ord' })
  @Transform(trimString)
  @IsString()
  @MaxLength(50)
  orderId: string;
}

export class LandPredictionResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90ord' })
  orderId: string;

  @ApiProperty({ example: 'wait' })
  recommendation: string;

  @ApiProperty({ example: 'high' })
  riskLevel: string;

  @ApiProperty({ example: '2026-06-13T08:00:00.000Z' })
  bestDepartureTime: string;

  @ApiProperty({ example: 140 })
  expectedDelayMinutes: number;

  @ApiProperty({
    example: 'Высокая загруженность КПП Темир Баба и ожидаются осадки.',
  })
  shortExplanation: string;
}
