import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SuperadminUsersController } from './controllers/superadmin-users.controller';
import { SuperadminCarriersModule } from './carriers/superadmin-carriers.module';
import { SuperadminOrdersModule } from './orders/superadmin-orders.module';
import { SuperadminVehiclesModule } from './vehicles/superadmin-vehicles.module';
import { SuperadminService } from './services/superadmin.service';

@Module({
  imports: [
    UsersModule,
    SuperadminCarriersModule,
    SuperadminOrdersModule,
    SuperadminVehiclesModule,
  ],
  controllers: [SuperadminUsersController],
  providers: [SuperadminService],
})
export class SuperadminModule {}
