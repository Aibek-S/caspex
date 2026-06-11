import { Module } from '@nestjs/common';
import { SuperadminOrdersController } from './controllers/superadmin-orders.controller';
import { SuperadminOrdersService } from './services/superadmin-orders.service';

@Module({
  controllers: [SuperadminOrdersController],
  providers: [SuperadminOrdersService],
})
export class SuperadminOrdersModule {}
