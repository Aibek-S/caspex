import { Module } from '@nestjs/common';
import { DevicesController } from './controllers/devices.controller';
import { DevicesRepository } from './repositories/devices.repository';
import { DevicesService } from './services/devices.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesService, DevicesRepository],
  exports: [DevicesRepository],
})
export class DevicesModule {}
