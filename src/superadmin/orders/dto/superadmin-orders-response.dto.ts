import { ApiProperty } from '@nestjs/swagger';
import { OrderResponseDto } from '../../../orders/dto/order-response.dto';

export class SuperadminOrderItemDto extends OrderResponseDto {
  @ApiProperty({ example: 'client01@caspex.local' })
  clientEmail: string;

  @ApiProperty({ example: 'Alibi' })
  clientFirstName: string;

  @ApiProperty({ example: 'Samatov' })
  clientLastName: string;

  @ApiProperty({ example: 'carrier01@caspex.local', nullable: true })
  carrierEmail: string | null;

  @ApiProperty({ example: 'Miras', nullable: true })
  carrierFirstName: string | null;

  @ApiProperty({ example: 'Ibrayev', nullable: true })
  carrierLastName: string | null;

}

export class SuperadminOrderEnvelopeResponseDto {
  @ApiProperty({ type: SuperadminOrderItemDto })
  order: SuperadminOrderItemDto;
}

export class SuperadminOrdersMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 25 })
  limit: number;

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  pages: number;
}

export class SuperadminOrdersListResponseDto {
  @ApiProperty({ type: [SuperadminOrderItemDto] })
  orders: SuperadminOrderItemDto[];

  @ApiProperty({ type: SuperadminOrdersMetaDto })
  meta: SuperadminOrdersMetaDto;
}
