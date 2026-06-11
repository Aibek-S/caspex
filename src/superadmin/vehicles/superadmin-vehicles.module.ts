import { Module } from '@nestjs/common';
import { SuperadminVehiclesController } from './controllers/superadmin-vehicles.controller';
import { SuperadminVehiclesService } from './services/superadmin-vehicles.service';

@Module({
  controllers: [SuperadminVehiclesController],
  providers: [SuperadminVehiclesService],
})
export class SuperadminVehiclesModule {}
