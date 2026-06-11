import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuperAdminOnly } from '../../../common/decorators/superadmin-only.decorator';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { ListSuperadminVehiclesQueryDto } from '../dto/list-superadmin-vehicles-query.dto';
import { SuperadminVehiclesListResponseDto } from '../dto/superadmin-vehicles-response.dto';
import { SuperadminVehiclesService } from '../services/superadmin-vehicles.service';

@Controller('superadmin/vehicles')
@ApiTags('Superadmin Vehicles')
@ApiBearerAuth('bearer')
@SuperAdminOnly()
@ApiUnauthorizedResponse({
  type: ErrorResponseDto,
  description: 'Unauthorized',
})
@ApiForbiddenResponse({
  type: ErrorResponseDto,
  description: 'SUPERADMIN role is required',
})
export class SuperadminVehiclesController {
  constructor(
    private readonly superadminVehiclesService: SuperadminVehiclesService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List vehicles for debugging and inspection' })
  @ApiQuery({ type: ListSuperadminVehiclesQueryDto })
  @ApiOkResponse({ type: SuperadminVehiclesListResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid query',
  })
  list(@Query() query: ListSuperadminVehiclesQueryDto) {
    return this.superadminVehiclesService.list(query);
  }
}
