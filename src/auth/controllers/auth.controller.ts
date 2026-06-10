import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/types/auth-user.type';
import { MeRateLimitGuard } from '../guards/me-rate-limit.guard';
import { RegisterRateLimitGuard } from '../guards/register-rate-limit.guard';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { RegisterDto } from '../dto/register.dto';
import {
  AuthTokensResponseDto,
  AuthUserEnvelopeResponseDto,
  LogoutResponseDto,
} from '../dto/auth-response.dto';
import { AuthService } from '../services/auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @UseGuards(RegisterRateLimitGuard)
  @ApiOperation({
    summary: 'Register account (public, rate-limited)',
    description:
      'Public self-signup endpoint. ADMIN and SUPERADMIN accounts can only be created by SUPERADMIN.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Email already exists',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponseDto,
    description: 'Registration rate limit exceeded',
  })
  register(
    @CurrentUser() actor: AuthUser | undefined,
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(actor, dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login (public)' })
  @ApiBody({ type: LoginDto })
  @ApiCreatedResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Invalid credentials',
  })
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, request);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT tokens (public)' })
  @ApiBody({ type: RefreshDto })
  @ApiCreatedResponse({ type: AuthTokensResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Invalid or expired refresh token',
  })
  refresh(@Body() dto: RefreshDto, @Req() request: Request) {
    return this.authService.refresh(dto, request);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout by revoking refresh token (public)' })
  @ApiBody({ type: LogoutDto })
  @ApiCreatedResponse({ type: LogoutResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  logout(@Body() dto: LogoutDto) {
    return this.authService.logout(dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile (protected)' })
  @ApiBearerAuth('bearer')
  @ApiOkResponse({ type: AuthUserEnvelopeResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Unauthorized',
  })
  @ApiTooManyRequestsResponse({
    type: ErrorResponseDto,
    description: 'Profile rate limit exceeded',
  })
  @UseGuards(JwtAuthGuard, MeRateLimitGuard)
  me(@CurrentUser() authUser: AuthUser) {
    return this.authService.me(authUser);
  }
}
