import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';

export class OrderTrackingItemDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90trk' })
  id: string;

  @ApiProperty({ example: 'cmmi83qoc00000kirq90ord' })
  orderId: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.IN_TRANSIT })
  status: OrderStatus;

  @ApiProperty({ example: 'Aktau, Microdistrict 15', nullable: true })
  location: string | null;

  @ApiProperty({ example: '2026-06-11T12:30:00.000Z' })
  timestamp: Date;

  @ApiProperty({ example: '2026-06-11T12:30:00.000Z' })
  createdAt: Date;
}

export class OrderTrackingEnvelopeResponseDto {
  @ApiProperty({ type: OrderTrackingItemDto })
  tracking: OrderTrackingItemDto;
}

export class OrderTrackingTimelineResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90ord' })
  orderId: string;

  @ApiProperty({ enum: OrderStatus, example: OrderStatus.IN_TRANSIT })
  currentStatus: OrderStatus;

  @ApiProperty({ type: [OrderTrackingItemDto] })
  tracking: OrderTrackingItemDto[];
}
