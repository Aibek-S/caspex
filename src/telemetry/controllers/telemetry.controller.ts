import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
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
  LatestTelemetryResponseDto,
  TelemetryListResponseDto,
} from '../dto/telemetry-response.dto';
import { TelemetryService } from '../services/telemetry.service';

@Controller('telemetry')
@ApiTags('Telemetry')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
export class TelemetryController {
  constructor(private readonly telemetryService: TelemetryService) {}

  @Get('vehicle/:vehicleId')
  @ApiOperation({
    summary: 'Get telemetry history for a vehicle',
    description:
      'Последние N показаний устройства машины (по времени, свежие сверху).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 100,
    description: 'Максимум записей (1..1000)',
  })
  @ApiOkResponse({ type: TelemetryListResponseDto })
  listByVehicle(
    @Param('vehicleId') vehicleId: string,
    @Query('limit') limit?: string,
  ) {
    return this.telemetryService.listByVehicle(
      vehicleId,
      limit ? Number(limit) : undefined,
    );
  }

  @Get('vehicle/:vehicleId/latest')
  @ApiOperation({
    summary: 'Get the latest telemetry reading for a vehicle',
    description:
      'Текущая позиция и показатели машины. reading=null, если данных ещё нет.',
  })
  @ApiOkResponse({ type: LatestTelemetryResponseDto })
  latestByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.telemetryService.latestByVehicle(vehicleId);
  }
}
