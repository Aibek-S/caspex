import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCarrierApprovalDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isApproved: boolean;
}
