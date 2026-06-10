import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersRepository } from '../users/repositories/users.repository';
import { AuthController } from './controllers/auth.controller';
import { MeRateLimitGuard } from './guards/me-rate-limit.guard';
import { RegisterRateLimitGuard } from './guards/register-rate-limit.guard';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Global()
@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    UsersRepository,
    RefreshTokenRepository,
    JwtAuthGuard,
    RolesGuard,
    RegisterRateLimitGuard,
    MeRateLimitGuard,
  ],
  exports: [
    AuthService,
    TokenService,
    UsersRepository,
    RefreshTokenRepository,
    JwtAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class AuthModule {}
