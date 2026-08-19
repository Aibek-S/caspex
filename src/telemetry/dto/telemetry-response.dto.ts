import { ApiProperty } from '@nestjs/swagger';

export class TelemetryReadingDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90rea' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90dev' })
  deviceId: string;

  @ApiProperty({ nullable: true, example: 'cmmi83qoc00000kirq90veh' })
  vehicleId: string | null;

  @ApiProperty({ nullable: true, example: 'cmmi83qoc00000kirq90ord' })
  orderId: string | null;

  @ApiProperty({ example: 43.6507 })
  lat: number;

  @ApiProperty({ example: 51.167 })
  lng: number;

  @ApiProperty({ nullable: true, example: 62.4 })
  speedKmh: number | null;

  @ApiProperty({ nullable: true, example: 27.3 })
  temperature: number | null;

  @ApiProperty({ nullable: true, example: 34.0 })
  humidity: number | null;

  @ApiProperty({ nullable: true, example: 3.2 })
  tilt: number | null;

  @ApiProperty({ nullable: true, example: false })
  doorOpen: boolean | null;

  @ApiProperty({ nullable: true, example: 88 })
  batteryPct: number | null;

  @ApiProperty({
    nullable: true,
    example: 'https://api/caspex/uploads/cam/1.jpg',
  })
  photoUrl: string | null;

  @ApiProperty({ example: 'mqtt' })
  source: string;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  ts: Date;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  createdAt: Date;
}

export class TelemetryListResponseDto {
  @ApiProperty({ type: [TelemetryReadingDto] })
  readings: TelemetryReadingDto[];
}

export class LatestTelemetryResponseDto {
  @ApiProperty({ type: TelemetryReadingDto, nullable: true })
  reading: TelemetryReadingDto | null;
}
