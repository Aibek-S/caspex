import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
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
import { CreateOrderTrackingDto } from '../dto/create-order-tracking.dto';
import {
  OrderTrackingEnvelopeResponseDto,
  OrderTrackingTimelineResponseDto,
} from '../dto/order-tracking-response.dto';
import { TrackingService } from '../services/tracking.service';

@Controller('orders/:id/tracking')
@ApiTags('Tracking')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post()
  @ApiOperation({ summary: 'Create tracking event for order' })
  @ApiCreatedResponse({ type: OrderTrackingEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiForbiddenResponse({
    type: ErrorResponseDto,
    description:
      'Only assigned carrier or SUPERADMIN can create tracking events',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description:
      'Tracking status cannot move backwards or update closed orders',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Order not found',
  })
  create(
    @CurrentUser() authUser: AuthUser,
    @Param('id') orderId: string,
    @Body() dto: CreateOrderTrackingDto,
  ) {
    return this.trackingService.createOrderTracking(authUser, orderId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get tracking timeline for order' })
  @ApiOkResponse({ type: OrderTrackingTimelineResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Order not found',
  })
  getTimeline(@CurrentUser() authUser: AuthUser, @Param('id') orderId: string) {
    return this.trackingService.getOrderTracking(authUser, orderId);
  }
}
