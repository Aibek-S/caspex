import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListSuperadminVehiclesQueryDto } from '../dto/list-superadmin-vehicles-query.dto';

@Injectable()
export class SuperadminVehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListSuperadminVehiclesQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {
      carrierId: query.carrierId,
      type: query.type,
      brand: query.brand,
      plateNumber: query.plateNumber,
      ...(query.search
        ? {
            OR: [
              { type: { contains: query.search, mode: 'insensitive' } },
              { brand: { contains: query.search, mode: 'insensitive' } },
              { model: { contains: query.search, mode: 'insensitive' } },
              {
                plateNumber: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                carrier: {
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
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        include: {
          carrier: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      vehicles: vehicles.map((vehicle) => ({
        id: vehicle.id,
        carrierId: vehicle.carrierId,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        plateNumber: vehicle.plateNumber,
        capacityTons: vehicle.capacityTons,
        cargoVolume: vehicle.cargoVolume,
        vehicleImageUrl: vehicle.vehicleImageUrl,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        carrierEmail: vehicle.carrier.user.email,
        carrierFirstName: vehicle.carrier.user.firstName,
        carrierLastName: vehicle.carrier.user.lastName,
      })),
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }
}
