import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuperAdminOnly } from '../../../common/decorators/superadmin-only.decorator';
import { ErrorResponseDto } from '../../../common/dto/error-response.dto';
import { ListSuperadminCarriersQueryDto } from '../dto/list-superadmin-carriers-query.dto';
import { UpdateCarrierApprovalDto } from '../dto/update-carrier-approval.dto';
import {
  SuperadminCarrierApprovalEnvelopeResponseDto,
  SuperadminCarriersListResponseDto,
} from '../dto/superadmin-carriers-response.dto';
import { SuperadminCarriersService } from '../services/superadmin-carriers.service';

@Controller('superadmin/carriers')
@ApiTags('Superadmin Carriers')
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
export class SuperadminCarriersController {
  constructor(
    private readonly superadminCarriersService: SuperadminCarriersService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List carrier profiles for debugging and moderation',
  })
  @ApiQuery({ type: ListSuperadminCarriersQueryDto })
  @ApiOkResponse({ type: SuperadminCarriersListResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid query',
  })
  list(@Query() query: ListSuperadminCarriersQueryDto) {
    return this.superadminCarriersService.list(query);
  }

  @Patch(':id/approval')
  @ApiOperation({ summary: 'Set carrier profile approval state' })
  @ApiOkResponse({ type: SuperadminCarrierApprovalEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Carrier profile not found',
  })
  setApproval(
    @Param('id') carrierProfileId: string,
    @Body() dto: UpdateCarrierApprovalDto,
  ) {
    return this.superadminCarriersService.setApproval(carrierProfileId, dto);
  }
}
