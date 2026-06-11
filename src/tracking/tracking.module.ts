import { Module } from '@nestjs/common';
import { CarrierModule } from '../carrier/carrier.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TrackingController } from './controllers/tracking.controller';
import { OrderTrackingRepository } from './repositories/order-tracking.repository';
import { TrackingService } from './services/tracking.service';

@Module({
  imports: [PrismaModule, CarrierModule],
  controllers: [TrackingController],
  providers: [TrackingService, OrderTrackingRepository],
  exports: [TrackingService],
})
export class TrackingModule {}
