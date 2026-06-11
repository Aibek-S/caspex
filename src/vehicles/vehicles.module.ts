import { Module } from '@nestjs/common';
import { CarrierModule } from '../carrier/carrier.module';
import { VehiclesController } from './controllers/vehicles.controller';
import { VehiclesRepository } from './repositories/vehicles.repository';
import { VehiclesService } from './services/vehicles.service';

@Module({
  imports: [CarrierModule],
  controllers: [VehiclesController],
  providers: [VehiclesService, VehiclesRepository],
})
export class VehiclesModule {}
