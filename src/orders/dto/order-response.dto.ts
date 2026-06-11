import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90ord' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90usr' })
  clientId: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90car', nullable: true })
  carrierId: string | null;

  @ApiProperty({ example: 'Transport construction materials to Kuryk' })
  title: string;

  @ApiProperty({ example: 'CONSTRUCTION_MATERIALS' })
  cargoType: string;

  @ApiProperty({ example: 12.5 })
  weight: number;

  @ApiProperty({ example: 42 })
  volume: number;

  @ApiProperty({ example: 'Aktau' })
  origin: string;

  @ApiProperty({ example: 'Kuryk Port' })
  destination: string;

  @ApiProperty({ example: 43.6532, nullable: true })
  originLat: number | null;

  @ApiProperty({ example: 51.1975, nullable: true })
  originLng: number | null;

  @ApiProperty({ example: 43.1789, nullable: true })
  destinationLat: number | null;

  @ApiProperty({ example: 51.6814, nullable: true })
  destinationLng: number | null;

  @ApiProperty({ example: 'Requires covered truck', nullable: true })
  comment: string | null;

  @ApiProperty({ example: 180000, nullable: true })
  estimatedPrice: number | null;

  @ApiProperty({ example: 8, nullable: true })
  estimatedDeliveryTime: number | null;

  @ApiProperty({ example: 120, nullable: true })
  estimatedCarrierSearchTime: number | null;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.SEARCHING })
  status: OrderStatus;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-11T04:18:44.902Z' })
  updatedAt: Date;
}

export class OrderEnvelopeResponseDto {
  @ApiProperty({ type: OrderResponseDto })
  order: OrderResponseDto;
}

export class OrdersListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];
}
