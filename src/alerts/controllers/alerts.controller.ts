import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  AlertEnvelopeResponseDto,
  AlertListResponseDto,
  ListAlertsQueryDto,
} from '../dto/alert-response.dto';
import { AlertsService } from '../services/alerts.service';

@Controller('alerts')
@ApiTags('Alerts')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({
    summary: 'List alerts',
    description: 'Фильтры: active, vehicleId, orderId, limit.',
  })
  @ApiQuery({ type: ListAlertsQueryDto })
  @ApiOkResponse({ type: AlertListResponseDto })
  list(@Query() query: ListAlertsQueryDto) {
    return this.alertsService.list(query);
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Mark alert as resolved' })
  @ApiOkResponse({ type: AlertEnvelopeResponseDto })
  resolve(@Param('id') id: string) {
    return this.alertsService.resolve(id);
  }
}
