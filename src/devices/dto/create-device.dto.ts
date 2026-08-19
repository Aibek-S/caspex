import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DeviceType } from '@prisma/client';

export class CreateDeviceDto {
  @ApiProperty({ example: 'GPS трекер Volvo FH16' })
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.GPS_TRACKER })
  @IsEnum(DeviceType)
  type: DeviceType;

  @ApiProperty({
    required: false,
    example: 'cmmi83qoc00000kirq90veh',
    description: 'ID машины, к которой привязывается устройство',
  })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ required: false, example: 'esp32-fw-1.0.0' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firmware?: string;
}
