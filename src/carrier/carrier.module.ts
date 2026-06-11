import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { CarrierController } from './controllers/carrier.controller';
import { CarrierProfileRepository } from './repositories/carrier-profile.repository';
import { CarrierService } from './services/carrier.service';

@Module({
  imports: [UsersModule],
  controllers: [CarrierController],
  providers: [CarrierService, CarrierProfileRepository],
  exports: [CarrierProfileRepository],
})
export class CarrierModule {}
