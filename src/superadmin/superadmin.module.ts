import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SuperadminUsersController } from './controllers/superadmin-users.controller';
import { SuperadminCarriersModule } from './carriers/superadmin-carriers.module';
import { SuperadminVehiclesModule } from './vehicles/superadmin-vehicles.module';
import { SuperadminService } from './services/superadmin.service';

@Module({
  imports: [UsersModule, SuperadminCarriersModule, SuperadminVehiclesModule],
  controllers: [SuperadminUsersController],
  providers: [SuperadminService],
})
export class SuperadminModule {}
