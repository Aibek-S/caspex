import { Injectable, Logger } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { DevicesRepository } from '../../devices/repositories/devices.repository';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../../realtime/realtime.gateway';
import { TelemetryRepository } from '../repositories/telemetry.repository';
import { AlertEngineService } from './alert-engine.service';

type TelemetryPayload = {
  apiKey?: unknown;
  lat?: unknown;
  lng?: unknown;
  speedKmh?: unknown;
  temperature?: unknown;
  humidity?: unknown;
  tilt?: unknown;
  doorOpen?: unknown;
  batteryPct?: unknown;
  photoUrl?: unknown;
  ts?: unknown;
};

@Injectable()
export class TelemetryIngestionService {
  private readonly logger = new Logger(TelemetryIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly devicesRepository: DevicesRepository,
    private readonly telemetryRepository: TelemetryRepository,
    private readonly alertEngine: AlertEngineService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async handle(deviceKey: string, rawPayload: unknown) {
    const device = await this.devicesRepository.findByDeviceKey(deviceKey);
    if (!device || !device.isActive) {
      this.logger.warn(
        `Unknown or inactive device tried to send telemetry: ${deviceKey}`,
      );
      return null;
    }

    if (!this.isValidPayload(rawPayload)) {
      this.logger.warn(`Malformed telemetry payload from ${deviceKey}`);
      return null;
    }

    const payload = rawPayload;
    const apiKey = typeof payload.apiKey === 'string' ? payload.apiKey : '';
    if (!apiKey) {
      this.logger.warn(`Missing apiKey from ${deviceKey}`);
      return null;
    }

    const apiKeyMatches = await bcrypt.compare(apiKey, device.apiKeyHash);
    if (!apiKeyMatches) {
      this.logger.warn(`Rejected telemetry: wrong apiKey for ${deviceKey}`);
      return null;
    }

    const lat = Number(payload.lat);
    const lng = Number(payload.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      this.logger.warn(`Invalid coordinates from ${deviceKey}`);
      return null;
    }

    const ts = payload.ts ? new Date(Number(payload.ts)) : new Date();
    const speedKmh = this.toNumberOrNull(payload.speedKmh);
    const temperature = this.toNumberOrNull(payload.temperature);
    const humidity = this.toNumberOrNull(payload.humidity);
    const tilt = this.toNumberOrNull(payload.tilt);
    const batteryPct = this.toNumberOrNull(payload.batteryPct);
    const doorOpen =
      typeof payload.doorOpen === 'boolean' ? payload.doorOpen : null;
    const photoUrl =
      typeof payload.photoUrl === 'string' ? payload.photoUrl : null;

    const vehicleId = device.vehicleId ?? null;
    let orderId: string | null = null;

    if (vehicleId) {
      const vehicle = await this.prisma.vehicle.findUnique({
        where: { id: vehicleId },
      });

      if (vehicle) {
        const activeOrder = await this.prisma.order.findFirst({
          where: {
            carrierId: vehicle.carrierId,
            status: { in: [OrderStatus.ASSIGNED, OrderStatus.IN_TRANSIT] },
          },
          orderBy: { updatedAt: 'desc' },
        });
        orderId = activeOrder?.id ?? null;

        await this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            lastLatitude: lat,
            lastLongitude: lng,
            lastSpeedKmh: speedKmh,
            lastTelemetryAt: ts,
          },
        });
      }
    }

    const reading = await this.telemetryRepository.createReading({
      deviceId: device.id,
      vehicleId,
      orderId,
      lat,
      lng,
      speedKmh,
      temperature,
      humidity,
      tilt,
      doorOpen,
      batteryPct,
      photoUrl,
      source: 'mqtt',
      ts,
      raw: this.sanitizeRaw(rawPayload),
    });

    await this.prisma.device.update({
      where: { id: device.id },
      data: {
        lastSeenAt: ts,
        lastLatitude: lat,
        lastLongitude: lng,
      },
    });

    const alerts = await this.alertEngine.evaluate({
      deviceId: device.id,
      vehicleId,
      orderId,
      temperature,
      humidity,
      tilt,
      doorOpen,
    });

    if (vehicleId) {
      this.realtimeGateway.emitPosition(vehicleId, {
        lat,
        lng,
        speedKmh,
        temperature,
        humidity,
        tilt,
        doorOpen,
        orderId,
        vehicleId,
        ts: ts.toISOString(),
      });
    }

    if (orderId) {
      this.realtimeGateway.emitOrderUpdate(orderId, {
        status: undefined,
        lat,
        lng,
        ts: ts.toISOString(),
      });
    }

    for (const alert of alerts) {
      this.realtimeGateway.emitAlert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        vehicleId: alert.vehicleId,
        orderId: alert.orderId,
        createdAt: alert.createdAt,
      });
    }

    return { reading, alerts };
  }

  private isValidPayload(raw: unknown): raw is TelemetryPayload {
    return (
      typeof raw === 'object' &&
      raw !== null &&
      !Array.isArray(raw) &&
      raw['apiKey'] != null
    );
  }

  private sanitizeRaw(raw: unknown): Prisma.InputJsonValue {
    const copy = { ...(raw as Record<string, unknown>) };
    delete copy['apiKey'];
    return copy as Prisma.InputJsonValue;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (typeof value !== 'number' && typeof value !== 'string') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }
}
