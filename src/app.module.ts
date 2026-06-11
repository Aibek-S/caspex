import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CarrierModule } from './carrier/carrier.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { TrackingModule } from './tracking/tracking.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CarrierModule,
    UsersModule,
    OrdersModule,
    SuperadminModule,
    TrackingModule,
    VehiclesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
