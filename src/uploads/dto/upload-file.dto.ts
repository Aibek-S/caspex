import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { OrderResponseDto } from '../../orders/dto/order-response.dto';
import { UserResponseDto } from '../../auth/dto/auth-response.dto';

export class UploadAvatarResponseDto {
  @ApiProperty({
    example: 'https://api-angels.byapex.dev/uploads/avatars/avatar-123.jpg',
  })
  url: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class UploadOrderMediaFormDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90ord' })
  @IsString()
  @MaxLength(50)
  orderId: string;
}

export class UploadOrderMediaResponseDto {
  @ApiProperty({
    example: 'https://api-angels.byapex.dev/uploads/cargo/cargo-123.jpg',
  })
  url: string;

  @ApiProperty({ type: OrderResponseDto })
  order: OrderResponseDto;
}
