import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CheckpointLoadsController } from './controllers/checkpoint-loads.controller';
import { CheckpointLoadsService } from './services/checkpoint-loads.service';

@Module({
  imports: [HttpModule],
  controllers: [CheckpointLoadsController],
  providers: [CheckpointLoadsService],
  exports: [CheckpointLoadsService],
})
export class CheckpointLoadsModule {}
