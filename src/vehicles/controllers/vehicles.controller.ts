import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
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
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import {
  VehicleEnvelopeResponseDto,
  VehiclesListResponseDto,
} from '../dto/vehicle-response.dto';
import { VehiclesService } from '../services/vehicles.service';

@Controller('vehicles')
@ApiTags('Vehicles')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ApiOperation({ summary: 'Create vehicle for current carrier profile' })
  @ApiCreatedResponse({ type: VehicleEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Vehicle plate number already exists',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile not found',
  })
  create(@CurrentUser() authUser: AuthUser, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(authUser, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List vehicles for current carrier profile' })
  @ApiOkResponse({ type: VehiclesListResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile not found',
  })
  list(@CurrentUser() authUser: AuthUser) {
    return this.vehiclesService.list(authUser);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update own vehicle' })
  @ApiOkResponse({ type: VehicleEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Vehicle plate number already exists',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile or vehicle not found',
  })
  update(
    @CurrentUser() authUser: AuthUser,
    @Param('id') vehicleId: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(authUser, vehicleId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete own vehicle' })
  @ApiOkResponse({ type: VehicleEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile or vehicle not found',
  })
  delete(@CurrentUser() authUser: AuthUser, @Param('id') vehicleId: string) {
    return this.vehiclesService.delete(authUser, vehicleId);
  }
}
