import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user.type';
import { UsersRepository } from '../../users/repositories/users.repository';
import { ApplyCarrierDto } from '../dto/apply-carrier.dto';
import { UpdateCarrierProfileDto } from '../dto/update-carrier-profile.dto';
import { CarrierProfileRepository } from '../repositories/carrier-profile.repository';

@Injectable()
export class CarrierService {
  constructor(
    private readonly carrierProfileRepository: CarrierProfileRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async apply(authUser: AuthUser, dto: ApplyCarrierDto) {
    const existingProfile = await this.carrierProfileRepository.findByUserId(
      authUser.id,
    );
    if (existingProfile) {
      throw new ConflictException('Carrier profile already exists');
    }

    const carrierProfile = await this.carrierProfileRepository.create({
      userId: authUser.id,
      experienceYears: dto.experienceYears,
      transportType: dto.transportType,
      description: dto.description ?? null,
    });

    if (authUser.role === UserRole.CLIENT) {
      await this.usersRepository.update(authUser.id, {
        role: UserRole.CARRIER,
      });
    }

    return { carrierProfile };
  }

  async getProfile(authUser: AuthUser) {
    const carrierProfile = await this.findOwnProfileOrThrow(authUser.id);
    return { carrierProfile };
  }

  async updateProfile(authUser: AuthUser, dto: UpdateCarrierProfileDto) {
    await this.findOwnProfileOrThrow(authUser.id);

    const carrierProfile = await this.carrierProfileRepository.updateByUserId(
      authUser.id,
      {
        experienceYears: dto.experienceYears,
        transportType: dto.transportType,
        description: dto.description,
      },
    );

    return { carrierProfile };
  }

  private async findOwnProfileOrThrow(userId: string) {
    const carrierProfile =
      await this.carrierProfileRepository.findByUserId(userId);
    if (!carrierProfile) {
      throw new NotFoundException('Carrier profile not found');
    }

    return carrierProfile;
  }
}
