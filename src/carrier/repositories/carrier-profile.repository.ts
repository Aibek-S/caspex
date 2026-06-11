import { Injectable } from '@nestjs/common';
import { CarrierProfile, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CarrierProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<CarrierProfile | null> {
    return this.prisma.carrierProfile.findUnique({
      where: { userId },
    });
  }

  async create(params: {
    userId: string;
    experienceYears: number;
    transportType: string;
    description?: string | null;
  }): Promise<CarrierProfile> {
    return this.prisma.carrierProfile.create({
      data: params,
    });
  }

  async updateByUserId(
    userId: string,
    data: Prisma.CarrierProfileUpdateInput,
  ): Promise<CarrierProfile> {
    return this.prisma.carrierProfile.update({
      where: { userId },
      data,
    });
  }
}
