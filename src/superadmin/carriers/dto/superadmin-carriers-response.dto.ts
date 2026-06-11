import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../../auth/dto/auth-response.dto';

export class SuperadminCarrierProfileItemDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90wkeon' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90user' })
  userId: string;

  @ApiProperty({ example: 5 })
  experienceYears: number;

  @ApiProperty({ example: 'ROAD' })
  transportType: string;

  @ApiProperty({ nullable: true, example: 'Regional carrier' })
  description: string | null;

  @ApiProperty({ example: false })
  isApproved: boolean;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  updatedAt: Date;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 3 })
  vehiclesCount: number;
}

export class SuperadminCarriersMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 25 })
  limit: number;

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  pages: number;
}

export class SuperadminCarriersListResponseDto {
  @ApiProperty({ type: [SuperadminCarrierProfileItemDto] })
  carriers: SuperadminCarrierProfileItemDto[];

  @ApiProperty({ type: SuperadminCarriersMetaDto })
  meta: SuperadminCarriersMetaDto;
}

export class SuperadminCarrierApprovalEnvelopeResponseDto {
  @ApiProperty({ type: SuperadminCarrierProfileItemDto })
  carrierProfile: SuperadminCarrierProfileItemDto;
}
