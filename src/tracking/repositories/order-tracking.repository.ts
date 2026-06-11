import { Injectable } from '@nestjs/common';
import { OrderTracking, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrderTrackingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.OrderTrackingUncheckedCreateInput) {
    return this.prisma.orderTracking.create({ data });
  }

  async findByOrderId(orderId: string): Promise<OrderTracking[]> {
    return this.prisma.orderTracking.findMany({
      where: { orderId },
      orderBy: [{ timestamp: 'asc' }, { createdAt: 'asc' }],
    });
  }
}
