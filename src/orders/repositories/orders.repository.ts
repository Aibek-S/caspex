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

  async findAvailable(): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: {
        carrierId: null,
        status: { in: [OrderStatus.NEW, OrderStatus.SEARCHING] },
      },
      orderBy: { createdAt: 'desc' },
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
