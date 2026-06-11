import { ApiProperty } from '@nestjs/swagger';

export class SuperadminVehicleItemDto {
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

  @ApiProperty({ example: 'client01@caspex.local', nullable: true })
  carrierEmail: string | null;

  @ApiProperty({ example: 'Alibi', nullable: true })
  carrierFirstName: string | null;

  @ApiProperty({ example: 'Samatov', nullable: true })
  carrierLastName: string | null;
}

export class SuperadminVehiclesMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 25 })
  limit: number;

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  pages: number;
}

export class SuperadminVehiclesListResponseDto {
  @ApiProperty({ type: [SuperadminVehicleItemDto] })
  vehicles: SuperadminVehicleItemDto[];

  @ApiProperty({ type: SuperadminVehiclesMetaDto })
  meta: SuperadminVehiclesMetaDto;
}
