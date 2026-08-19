import { Injectable } from '@nestjs/common';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrderUncheckedCreateInput): Promise<Order> {
    return this.prisma.order.create({ data });
  }

  async findById(id: string): Promise<Order | null> {
    return this.prisma.order.findUnique({ where: { id } });
  }

  async findManyForUser(userId: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        OR: [{ clientId: userId }, { carrier: { userId } }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailable(params: {
    origin?: string;
    destination?: string;
    weightMin?: number;
    weightMax?: number;
    sortBy?: 'createdAt' | 'weight';
    order?: 'asc' | 'desc';
    limit?: number;
  }): Promise<Order[]> {
    const sortBy = params.sortBy === 'weight' ? 'weight' : 'createdAt';
    const order = params.order === 'asc' ? 'asc' : 'desc';

    const where: Prisma.OrderWhereInput = {
      carrierId: null,
      status: { in: [OrderStatus.NEW, OrderStatus.SEARCHING] },
      weight: {
        gte: params.weightMin,
        lte: params.weightMax,
      },
    };

    if (params.origin) {
      where.OR = [
        { origin: { contains: params.origin, mode: 'insensitive' } },
        { originCity: { contains: params.origin, mode: 'insensitive' } },
      ];
    }

    if (params.destination) {
      where.AND = [
        {
          OR: [
            {
              destination: {
                contains: params.destination,
                mode: 'insensitive',
              },
            },
            {
              destinationCity: {
                contains: params.destination,
                mode: 'insensitive',
              },
            },
          ],
        },
      ];
    }

    return this.prisma.order.findMany({
      where,
      orderBy: { [sortBy]: order },
      take: params.limit,
    });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return this.prisma.order.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Order> {
    return this.prisma.order.delete({ where: { id } });
  }
}
