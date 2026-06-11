import { ApiProperty } from '@nestjs/swagger';

export class CarrierProfileResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90wkeon' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90user' })
  userId: string;

  @ApiProperty({ example: 5 })
  experienceYears: number;

  @ApiProperty({ example: 'ROAD' })
  transportType: string;

  @ApiProperty({
    nullable: true,
    example: 'Experienced regional truck carrier based in Aktau.',
  })
  description: string | null;

  @ApiProperty({ example: false })
  isApproved: boolean;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  updatedAt: Date;
}

export class CarrierProfileEnvelopeResponseDto {
  @ApiProperty({ type: CarrierProfileResponseDto })
  carrierProfile: CarrierProfileResponseDto;
}
