import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListAlertsQueryDto } from '../dto/alert-response.dto';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAlertsQueryDto) {
    const limit = Math.min(Math.max(Number(query.limit) || 100, 1), 500);
    const active = query.active === 'true' ? true : undefined;

    const alerts = await this.prisma.alert.findMany({
      where: {
        active,
        vehicleId: query.vehicleId,
        orderId: query.orderId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { alerts };
  }

  async resolve(id: string) {
    const existing = await this.prisma.alert.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Alert not found');
    }

    const alert = await this.prisma.alert.update({
      where: { id },
      data: {
        active: false,
        resolvedAt: existing.resolvedAt ?? new Date(),
      },
    });

    return { alert };
  }
}
