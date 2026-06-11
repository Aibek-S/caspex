import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { UploadsController } from './controllers/uploads.controller';
import { UploadsService } from './services/uploads.service';

@Module({
  imports: [UsersModule, OrdersModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
