import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../../common/types/auth-user.type';
import { CarrierProfileRepository } from '../../carrier/repositories/carrier-profile.repository';
import { CreateVehicleDto } from '../dto/create-vehicle.dto';
import { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import { VehiclesRepository } from '../repositories/vehicles.repository';

@Injectable()
export class VehiclesService {
  constructor(
    private readonly carrierProfileRepository: CarrierProfileRepository,
    private readonly vehiclesRepository: VehiclesRepository,
  ) {}

  async create(authUser: AuthUser, dto: CreateVehicleDto) {
    const carrierProfile = await this.findOwnCarrierProfileOrThrow(authUser.id);

    try {
      const vehicle = await this.vehiclesRepository.create({
        carrierId: carrierProfile.id,
        type: dto.type,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        plateNumber: dto.plateNumber,
        capacityTons: dto.capacityTons,
        cargoVolume: dto.cargoVolume,
        vehicleImageUrl: dto.vehicleImageUrl ?? null,
      });

      return { vehicle };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Vehicle plate number already exists');
      }

      throw error;
    }
  }

  async list(authUser: AuthUser) {
    const carrierProfile = await this.findOwnCarrierProfileOrThrow(authUser.id);
    const vehicles = await this.vehiclesRepository.findByCarrierId(
      carrierProfile.id,
    );

    return { vehicles };
  }

  async update(authUser: AuthUser, vehicleId: string, dto: UpdateVehicleDto) {
    const carrierProfile = await this.findOwnCarrierProfileOrThrow(authUser.id);
    await this.findOwnedVehicleOrThrow(vehicleId, carrierProfile.id);

    try {
      const vehicle = await this.vehiclesRepository.updateOwnedById({
        id: vehicleId,
        carrierId: carrierProfile.id,
        data: {
          type: dto.type,
          brand: dto.brand,
          model: dto.model,
          year: dto.year,
          plateNumber: dto.plateNumber,
          capacityTons: dto.capacityTons,
          cargoVolume: dto.cargoVolume,
          vehicleImageUrl: dto.vehicleImageUrl,
        },
      });

      return { vehicle };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Vehicle plate number already exists');
      }

      throw error;
    }
  }

  async delete(authUser: AuthUser, vehicleId: string) {
    const carrierProfile = await this.findOwnCarrierProfileOrThrow(authUser.id);
    await this.findOwnedVehicleOrThrow(vehicleId, carrierProfile.id);
    const vehicle = await this.vehiclesRepository.deleteOwnedById({
      id: vehicleId,
      carrierId: carrierProfile.id,
    });

    return { vehicle };
  }

  private async findOwnCarrierProfileOrThrow(userId: string) {
    const carrierProfile =
      await this.carrierProfileRepository.findByUserId(userId);
    if (!carrierProfile) {
      throw new NotFoundException('Carrier profile not found');
    }

    return carrierProfile;
  }

  private async findOwnedVehicleOrThrow(vehicleId: string, carrierId: string) {
    const vehicle = await this.vehiclesRepository.findOwnedById({
      id: vehicleId,
      carrierId,
    });
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }
}
