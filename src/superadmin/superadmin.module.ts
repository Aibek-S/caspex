import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { SuperadminUsersController } from './controllers/superadmin-users.controller';
import { SuperadminService } from './services/superadmin.service';

@Module({
  imports: [UsersModule],
  controllers: [SuperadminUsersController],
  providers: [SuperadminService],
})
export class SuperadminModule {}
