import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';

export class DeviceResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90dev' })
  id: string;

  @ApiProperty({ example: 'GPS трекер Volvo FH16' })
  name: string;

  @ApiProperty({ example: 'dev_a1b2c3d4' })
  deviceKey: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.GPS_TRACKER })
  type: DeviceType;

  @ApiProperty({ nullable: true, example: 'cmmi83qoc00000kirq90veh' })
  vehicleId: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ nullable: true, example: 'esp32-fw-1.0.0' })
  firmware: string | null;

  @ApiProperty({ nullable: true, example: '2026-08-19T10:00:00.000Z' })
  lastSeenAt: Date | null;

  @ApiProperty({ nullable: true, example: 43.6507 })
  lastLatitude: number | null;

  @ApiProperty({ nullable: true, example: 51.167 })
  lastLongitude: number | null;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-19T10:00:00.000Z' })
  updatedAt: Date;
}

export class DeviceCreatedResponseDto extends DeviceResponseDto {
  @ApiProperty({
    example: 'sk_casp_8f2e...',
    description: 'Секретный ключ устройства. Показывается только один раз!',
  })
  apiKey: string;
}

export class DeviceEnvelopeResponseDto {
  @ApiProperty({ type: DeviceResponseDto })
  device: DeviceResponseDto;
}

export class DeviceCreatedEnvelopeResponseDto {
  @ApiProperty({ type: DeviceCreatedResponseDto })
  device: DeviceCreatedResponseDto;
}

export class DevicesListResponseDto {
  @ApiProperty({ type: [DeviceResponseDto] })
  devices: DeviceResponseDto[];
}
