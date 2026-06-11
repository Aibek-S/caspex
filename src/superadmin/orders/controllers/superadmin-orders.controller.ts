import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
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
import { ListSuperadminOrdersQueryDto } from '../dto/list-superadmin-orders-query.dto';
import {
  SuperadminOrderEnvelopeResponseDto,
  SuperadminOrdersListResponseDto,
} from '../dto/superadmin-orders-response.dto';
import { UpdateSuperadminOrderDto } from '../dto/update-superadmin-order.dto';
import { SuperadminOrdersService } from '../services/superadmin-orders.service';

@Controller('superadmin/orders')
@ApiTags('Superadmin Orders')
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
export class SuperadminOrdersController {
  constructor(
    private readonly superadminOrdersService: SuperadminOrdersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List orders for moderation and debugging' })
  @ApiQuery({ type: ListSuperadminOrdersQueryDto })
  @ApiOkResponse({ type: SuperadminOrdersListResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid query',
  })
  list(@Query() query: ListSuperadminOrdersQueryDto) {
    return this.superadminOrdersService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by id for moderation' })
  @ApiOkResponse({ type: SuperadminOrderEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Order not found',
  })
  getById(@Param('id') orderId: string) {
    return this.superadminOrdersService.getById(orderId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update order as superadmin' })
  @ApiOkResponse({ type: SuperadminOrderEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Order or carrier profile not found',
  })
  update(@Param('id') orderId: string, @Body() dto: UpdateSuperadminOrderDto) {
    return this.superadminOrdersService.update(orderId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order as superadmin' })
  @ApiOkResponse({ type: SuperadminOrderEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Order not found',
  })
  delete(@Param('id') orderId: string) {
    return this.superadminOrdersService.delete(orderId);
  }
}
