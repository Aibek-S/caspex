import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RoutesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    orderId: string | null;
    distanceKm: number;
    durationMinutes: number;
    geometry: Prisma.InputJsonValue;
  }) {
    return (this.prisma as any).route.create({ data });
  }
}
