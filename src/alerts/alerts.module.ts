import { Module } from '@nestjs/common';
import { AlertsController } from './controllers/alerts.controller';
import { AlertsService } from './services/alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
