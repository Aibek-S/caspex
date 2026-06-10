import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../auth/dto/auth-response.dto';

export class SuperadminUsersMetaResponseDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 25 })
  limit: number;

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 2 })
  pages: number;
}

export class SuperadminUsersListResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  users: UserResponseDto[];

  @ApiProperty({ type: SuperadminUsersMetaResponseDto })
  meta: SuperadminUsersMetaResponseDto;
}
