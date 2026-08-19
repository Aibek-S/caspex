import { Injectable } from '@nestjs/common';
import { Prisma, TelemetryReading } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateReadingParams = {
  deviceId: string;
  vehicleId?: string | null;
  orderId?: string | null;
  lat: number;
  lng: number;
  speedKmh?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  tilt?: number | null;
  doorOpen?: boolean | null;
  batteryPct?: number | null;
  photoUrl?: string | null;
  source?: string;
  ts: Date;
  raw?: Prisma.InputJsonValue;
};

@Injectable()
export class TelemetryRepository {
  constructor(private readonly prisma: PrismaService) {}

  createReading(params: CreateReadingParams): Promise<TelemetryReading> {
    return this.prisma.telemetryReading.create({
      data: {
        deviceId: params.deviceId,
        vehicleId: params.vehicleId ?? null,
        orderId: params.orderId ?? null,
        lat: params.lat,
        lng: params.lng,
        speedKmh: params.speedKmh ?? null,
        temperature: params.temperature ?? null,
        humidity: params.humidity ?? null,
        tilt: params.tilt ?? null,
        doorOpen: params.doorOpen ?? null,
        batteryPct: params.batteryPct ?? null,
        photoUrl: params.photoUrl ?? null,
        source: params.source ?? 'mqtt',
        ts: params.ts,
        raw: params.raw,
      },
    });
  }

  findByVehicle(vehicleId: string, limit: number): Promise<TelemetryReading[]> {
    return this.prisma.telemetryReading.findMany({
      where: { vehicleId },
      orderBy: { ts: 'desc' },
      take: limit,
    });
  }

  findLatestByVehicle(vehicleId: string): Promise<TelemetryReading | null> {
    return this.prisma.telemetryReading.findFirst({
      where: { vehicleId },
      orderBy: { ts: 'desc' },
    });
  }
}
