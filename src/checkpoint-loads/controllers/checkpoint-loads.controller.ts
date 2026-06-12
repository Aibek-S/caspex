import { Controller, Get, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SuperAdminOnly } from '../../common/decorators/superadmin-only.decorator';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import {
  CheckpointLoadCurrentResponseDto,
  CheckpointLoadSyncResponseDto,
} from '../dto/checkpoint-load-response.dto';
import { CheckpointLoadsService } from '../services/checkpoint-loads.service';

@Controller('checkpoint-loads')
@ApiTags('Checkpoint Loads')
export class CheckpointLoadsController {
  constructor(
    private readonly checkpointLoadsService: CheckpointLoadsService,
  ) {}

  @Get('current')
  @Public()
  @ApiOperation({
    summary:
      'Return the latest normalized checkpoint load snapshot scraped from public Qoldau pages',
  })
  @ApiOkResponse({ type: CheckpointLoadCurrentResponseDto })
  @ApiNotFoundResponse({
    type: ErrorResponseDto,
    description: 'No checkpoint load snapshots found. Run sync first.',
  })
  getCurrent() {
    return this.checkpointLoadsService.getCurrentLoads();
  }

  @Post('sync')
  @SuperAdminOnly()
  @ApiBearerAuth('bearer')
  @ApiOperation({
    summary:
      'Scrape public Qoldau pages and persist a fresh checkpoint load snapshot batch',
  })
  @ApiCreatedResponse({ type: CheckpointLoadSyncResponseDto })
  sync() {
    return this.checkpointLoadsService.syncCurrentLoads();
  }
}
