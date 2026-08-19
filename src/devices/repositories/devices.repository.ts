import { Injectable } from '@nestjs/common';
import { Device, DeviceType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(params: {
    name: string;
    deviceKey: string;
    apiKeyHash: string;
    type: DeviceType;
    vehicleId?: string | null;
    firmware?: string | null;
  }): Promise<Device> {
    return this.prisma.device.create({ data: params });
  }

  findById(id: string): Promise<Device | null> {
    return this.prisma.device.findUnique({ where: { id } });
  }

  findByDeviceKey(deviceKey: string): Promise<Device | null> {
    return this.prisma.device.findUnique({ where: { deviceKey } });
  }

  list(): Promise<Device[]> {
    return this.prisma.device.findMany({ orderBy: { createdAt: 'desc' } });
  }

  update(id: string, data: Prisma.DeviceUpdateInput): Promise<Device> {
    return this.prisma.device.update({ where: { id }, data });
  }

  delete(id: string): Promise<Device> {
    return this.prisma.device.delete({ where: { id } });
  }
}
