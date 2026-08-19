import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { DeviceType } from '@prisma/client';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 'GPS трекер Volvo FH16' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ enum: DeviceType })
  @IsOptional()
  @IsEnum(DeviceType)
  type?: DeviceType;

  @ApiPropertyOptional({
    example: 'cmmi83qoc00000kirq90veh',
    nullable: true,
    description: 'null — отвязать от машины',
  })
  @IsOptional()
  @IsString()
  vehicleId?: string | null;

  @ApiPropertyOptional({ example: 'esp32-fw-1.1.0', nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  firmware?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
