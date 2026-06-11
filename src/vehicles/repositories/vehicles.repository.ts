import { Injectable } from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VehiclesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(params: {
    carrierId: string;
    type: string;
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
    capacityTons: number;
    cargoVolume: number;
    vehicleImageUrl?: string | null;
  }): Promise<Vehicle> {
    return this.prisma.vehicle.create({
      data: params,
    });
  }

  async findByCarrierId(carrierId: string): Promise<Vehicle[]> {
    return this.prisma.vehicle.findMany({
      where: { carrierId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOwnedById(params: {
    id: string;
    carrierId: string;
  }): Promise<Vehicle | null> {
    return this.prisma.vehicle.findFirst({
      where: {
        id: params.id,
        carrierId: params.carrierId,
      },
    });
  }

  async updateOwnedById(params: {
    id: string;
    carrierId: string;
    data: Prisma.VehicleUpdateInput;
  }): Promise<Vehicle> {
    return this.prisma.vehicle.update({
      where: { id: params.id },
      data: params.data,
    });
  }

  async deleteOwnedById(params: {
    id: string;
    carrierId: string;
  }): Promise<Vehicle> {
    return this.prisma.vehicle.delete({
      where: { id: params.id },
    });
  }
}
