import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { AuthUser } from '../../common/types/auth-user.type';
import { ApplyCarrierDto } from '../dto/apply-carrier.dto';
import { CarrierProfileEnvelopeResponseDto } from '../dto/carrier-response.dto';
import { UpdateCarrierProfileDto } from '../dto/update-carrier-profile.dto';
import { CarrierService } from '../services/carrier.service';

@Controller('carrier')
@ApiTags('Carrier')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
export class CarrierController {
  constructor(private readonly carrierService: CarrierService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply to become a carrier' })
  @ApiOkResponse({ type: CarrierProfileEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile already exists',
  })
  apply(@CurrentUser() authUser: AuthUser, @Body() dto: ApplyCarrierDto) {
    return this.carrierService.apply(authUser, dto);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current carrier profile' })
  @ApiOkResponse({ type: CarrierProfileEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile not found',
  })
  getProfile(@CurrentUser() authUser: AuthUser) {
    return this.carrierService.getProfile(authUser);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update current carrier profile' })
  @ApiOkResponse({ type: CarrierProfileEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile not found',
  })
  updateProfile(
    @CurrentUser() authUser: AuthUser,
    @Body() dto: UpdateCarrierProfileDto,
  ) {
    return this.carrierService.updateProfile(authUser, dto);
  }
}
