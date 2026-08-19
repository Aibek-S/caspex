import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { TelemetryController } from './controllers/telemetry.controller';
import { TelemetryRepository } from './repositories/telemetry.repository';
import { AlertEngineService } from './services/alert-engine.service';
import { MqttIngestionService } from './services/mqtt-ingestion.service';
import { TelemetryIngestionService } from './services/telemetry-ingestion.service';
import { TelemetryService } from './services/telemetry.service';

@Module({
  imports: [DevicesModule, RealtimeModule],
  controllers: [TelemetryController],
  providers: [
    TelemetryService,
    TelemetryRepository,
    TelemetryIngestionService,
    MqttIngestionService,
    AlertEngineService,
  ],
  exports: [TelemetryRepository],
})
export class TelemetryModule {}
