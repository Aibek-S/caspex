import { Module } from '@nestjs/common';
import { SuperadminCarriersController } from './controllers/superadmin-carriers.controller';
import { SuperadminCarriersService } from './services/superadmin-carriers.service';

@Module({
  controllers: [SuperadminCarriersController],
  providers: [SuperadminCarriersService],
})
export class SuperadminCarriersModule {}
