import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SuperAdminOnly } from '../../common/decorators/superadmin-only.decorator';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { CreateDeviceDto } from '../dto/create-device.dto';
import {
  DeviceCreatedEnvelopeResponseDto,
  DeviceEnvelopeResponseDto,
  DevicesListResponseDto,
} from '../dto/device-response.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { DevicesService } from '../services/devices.service';

@Controller('devices')
@ApiTags('Devices')
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
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create device and get its secret key',
    description:
      'Возвращает apiKey ровно один раз. Запишите его в прошивку устройства.',
  })
  @ApiCreatedResponse({ type: DeviceCreatedEnvelopeResponseDto })
  @ApiBadRequestResponse({
    type: ErrorResponseDto,
    description: 'Invalid payload',
  })
  create(@Body() dto: CreateDeviceDto) {
    return this.devicesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all devices' })
  @ApiOkResponse({ type: DevicesListResponseDto })
  list() {
    return this.devicesService.list();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device by id' })
  @ApiOkResponse({ type: DeviceEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Device not found',
  })
  getById(@Param('id') id: string) {
    return this.devicesService.getById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update device',
    description: 'Привязка/отвязка машины, активация, смена имени.',
  })
  @ApiOkResponse({ type: DeviceEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Device not found',
  })
  update(@Param('id') id: string, @Body() dto: UpdateDeviceDto) {
    return this.devicesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete device' })
  @ApiOkResponse({ type: DeviceEnvelopeResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'Device not found',
  })
  delete(@Param('id') id: string) {
    return this.devicesService.delete(id);
  }
}
