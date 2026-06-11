import { ApiProperty } from '@nestjs/swagger';

export class VehicleResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90veh' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90car' })
  carrierId: string;

  @ApiProperty({ example: 'TRUCK' })
  type: string;

  @ApiProperty({ example: 'Volvo' })
  brand: string;

  @ApiProperty({ example: 'FH16' })
  model: string;

  @ApiProperty({ example: 2021 })
  year: number;

  @ApiProperty({ example: '123ABC12' })
  plateNumber: string;

  @ApiProperty({ example: 20 })
  capacityTons: number;

  @ApiProperty({ example: 86 })
  cargoVolume: number;

  @ApiProperty({ nullable: true, example: 'https://example.com/vehicle.jpg' })
  vehicleImageUrl: string | null;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  updatedAt: Date;
}

export class VehicleEnvelopeResponseDto {
  @ApiProperty({ type: VehicleResponseDto })
  vehicle: VehicleResponseDto;
}

export class VehiclesListResponseDto {
  @ApiProperty({ type: [VehicleResponseDto] })
  vehicles: VehicleResponseDto[];
}
