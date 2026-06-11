import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { toUserResponse } from '../../../common/utils/user-response.util';
import { ListSuperadminCarriersQueryDto } from '../dto/list-superadmin-carriers-query.dto';
import { UpdateCarrierApprovalDto } from '../dto/update-carrier-approval.dto';

@Injectable()
export class SuperadminCarriersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListSuperadminCarriersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.CarrierProfileWhereInput = {
      isApproved: query.isApproved,
      transportType: query.transportType,
      ...(query.search
        ? {
            OR: [
              {
                transportType: { contains: query.search, mode: 'insensitive' },
              },
              { description: { contains: query.search, mode: 'insensitive' } },
              {
                user: {
                  OR: [
                    {
                      email: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      firstName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      phone: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      companyName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    const [carriers, total] = await Promise.all([
      this.prisma.carrierProfile.findMany({
        where,
        include: {
          user: true,
          _count: {
            select: { vehicles: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.carrierProfile.count({ where }),
    ]);

    return {
      carriers: carriers.map((carrier) => ({
        id: carrier.id,
        userId: carrier.userId,
        experienceYears: carrier.experienceYears,
        transportType: carrier.transportType,
        description: carrier.description,
        isApproved: carrier.isApproved,
        createdAt: carrier.createdAt,
        updatedAt: carrier.updatedAt,
        user: toUserResponse(carrier.user),
        vehiclesCount: carrier._count.vehicles,
      })),
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async setApproval(carrierProfileId: string, dto: UpdateCarrierApprovalDto) {
    const existing = await this.prisma.carrierProfile.findUnique({
      where: { id: carrierProfileId },
    });

    if (!existing) {
      throw new NotFoundException('Carrier profile not found');
    }

    const carrierProfile = await this.prisma.carrierProfile.update({
      where: { id: carrierProfileId },
      data: {
        isApproved: dto.isApproved,
      },
      include: {
        user: true,
        _count: {
          select: { vehicles: true },
        },
      },
    });

    return {
      carrierProfile: {
        id: carrierProfile.id,
        userId: carrierProfile.userId,
        experienceYears: carrierProfile.experienceYears,
        transportType: carrierProfile.transportType,
        description: carrierProfile.description,
        isApproved: carrierProfile.isApproved,
        createdAt: carrierProfile.createdAt,
        updatedAt: carrierProfile.updatedAt,
        user: toUserResponse(carrierProfile.user),
        vehiclesCount: carrierProfile._count.vehicles,
      },
    };
  }
}
