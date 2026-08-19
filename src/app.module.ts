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
import { RoutesModule } from './routes/routes.module';
import { UploadsModule } from './uploads/uploads.module';
import { CheckpointLoadsModule } from './checkpoint-loads/checkpoint-loads.module';
import { PredictionsModule } from './predictions/predictions.module';
import { DevicesModule } from './devices/devices.module';
import { TelemetryModule } from './telemetry/telemetry.module';
import { AlertsModule } from './alerts/alerts.module';
import { RealtimeModule } from './realtime/realtime.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { RouteConditionsModule } from './route-conditions/route-conditions.module';

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
    RoutesModule,
    UploadsModule,
    CheckpointLoadsModule,
    PredictionsModule,
    DevicesModule,
    TelemetryModule,
    AlertsModule,
    RealtimeModule,
    AnalyticsModule,
    RouteConditionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
