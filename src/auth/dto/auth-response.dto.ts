import { UserRole } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 'cmmi83qoc00000kirq90wkeon' })
  id: string;

  @ApiProperty({ example: 'client01@caspex.local' })
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CLIENT })
  role: UserRole;

  @ApiProperty({ example: 'Alibi' })
  firstName: string;

  @ApiProperty({ example: 'Samatov' })
  lastName: string;

  @ApiProperty({ example: '+77017777777' })
  phone: string;

  @ApiProperty({ nullable: true, example: 'https://example.com/avatar.jpg' })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true, example: 'Mangystau Trans LLC' })
  companyName: string | null;

  @ApiProperty({ nullable: true, example: 'https://example.com/logo.png' })
  companyLogo: string | null;

  @ApiProperty({ nullable: true, example: 'Aktau' })
  city: string | null;

  @ApiProperty({ nullable: true, example: 'Kazakhstan' })
  country: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ nullable: true, example: '2026-03-09T04:18:44.902Z' })
  lastLoginAt: Date | null;

  @ApiProperty({ example: '2026-03-09T04:18:44.902Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-03-09T04:18:44.902Z' })
  updatedAt: Date;
}

export class AuthTokensResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class AuthUserEnvelopeResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  success: boolean;
}
