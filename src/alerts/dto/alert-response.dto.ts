import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity, AlertType } from '@prisma/client';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AlertResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90alr' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90dev' })
  deviceId: string;

  @ApiProperty({ nullable: true, example: 'cmmi83qoc00000kirq90veh' })
  vehicleId: string | null;

  @ApiProperty({ nullable: true, example: 'cmmi83qoc00000kirq90ord' })
  orderId: string | null;

  @ApiProperty({ enum: AlertType, example: AlertType.TEMPERATURE_HIGH })
  type: AlertType;

  @ApiProperty({ enum: AlertSeverity, example: AlertSeverity.WARNING })
  severity: AlertSeverity;

  @ApiProperty({ example: 'Температура выше нормы (31°C)' })
  message: string;

  @ApiProperty({ nullable: true, example: { temperature: 31 } })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ nullable: true })
  resolvedAt: Date | null;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  createdAt: Date;
}

export class AlertListResponseDto {
  @ApiProperty({ type: [AlertResponseDto] })
  alerts: AlertResponseDto[];
}

export class AlertEnvelopeResponseDto {
  @ApiProperty({ type: AlertResponseDto })
  alert: AlertResponseDto;
}

export class ListAlertsQueryDto {
  @ApiPropertyOptional({ example: 'true', description: 'Только активные' })
  @IsOptional()
  @IsString()
  active?: string;

  @ApiPropertyOptional({ example: 'cmmi83qoc00000kirq90veh' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'cmmi83qoc00000kirq90ord' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  orderId?: string;

  @ApiPropertyOptional({ example: 100, description: '1..500' })
  @IsOptional()
  @IsString()
  limit?: string;
}
