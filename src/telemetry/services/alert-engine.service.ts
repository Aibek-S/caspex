import { Injectable, Logger } from '@nestjs/common';
import { Alert, AlertSeverity, AlertType, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

type EvaluateParams = {
  deviceId: string;
  vehicleId: string | null;
  orderId?: string | null;
  temperature?: number | null;
  humidity?: number | null;
  tilt?: number | null;
  doorOpen?: boolean | null;
};

type RuleContext = {
  deviceId: string;
  vehicleId: string | null;
  orderId?: string | null;
};

@Injectable()
export class AlertEngineService {
  private readonly logger = new Logger(AlertEngineService.name);

  private readonly tempMin = Number(process.env.ALERT_TEMP_MIN ?? 2);
  private readonly tempMax = Number(process.env.ALERT_TEMP_MAX ?? 30);
  private readonly humidityMin = Number(process.env.ALERT_HUMIDITY_MIN ?? 10);
  private readonly humidityMax = Number(process.env.ALERT_HUMIDITY_MAX ?? 95);
  private readonly tiltDegrees = Number(process.env.ALERT_TILT_DEGREES ?? 30);

  constructor(private readonly prisma: PrismaService) {}

  async evaluate(params: EvaluateParams): Promise<Alert[]> {
    const created: (Alert | null)[] = [];
    const ctx: RuleContext = {
      deviceId: params.deviceId,
      vehicleId: params.vehicleId,
      orderId: params.orderId,
    };

    if (params.temperature != null) {
      if (params.temperature > this.tempMax) {
        created.push(
          await this.trigger(ctx, 'TEMPERATURE_HIGH', 'CRITICAL', {
            temperature: params.temperature,
          }),
        );
      } else if (params.temperature < this.tempMin) {
        created.push(
          await this.trigger(ctx, 'TEMPERATURE_LOW', 'WARNING', {
            temperature: params.temperature,
          }),
        );
      } else {
        await this.resolve(ctx, 'TEMPERATURE_HIGH');
        await this.resolve(ctx, 'TEMPERATURE_LOW');
      }
    }

    if (params.humidity != null) {
      if (params.humidity > this.humidityMax) {
        created.push(
          await this.trigger(ctx, 'HUMIDITY_HIGH', 'WARNING', {
            humidity: params.humidity,
          }),
        );
      } else if (params.humidity < this.humidityMin) {
        created.push(
          await this.trigger(ctx, 'HUMIDITY_LOW', 'INFO', {
            humidity: params.humidity,
          }),
        );
      } else {
        await this.resolve(ctx, 'HUMIDITY_HIGH');
        await this.resolve(ctx, 'HUMIDITY_LOW');
      }
    }

    if (params.tilt != null) {
      if (Math.abs(params.tilt) > this.tiltDegrees) {
        created.push(
          await this.trigger(ctx, 'TILT', 'CRITICAL', {
            tilt: params.tilt,
          }),
        );
      } else {
        await this.resolve(ctx, 'TILT');
      }
    }

    if (params.doorOpen != null) {
      if (params.doorOpen) {
        created.push(
          await this.trigger(ctx, 'DOOR_OPEN', 'WARNING', {
            doorOpen: true,
          }),
        );
      } else {
        await this.resolve(ctx, 'DOOR_OPEN');
      }
    }

    return created.filter((alert): alert is Alert => alert !== null);
  }

  private async trigger(
    ctx: RuleContext,
    type: AlertType,
    severity: AlertSeverity,
    metadata: Record<string, unknown>,
  ): Promise<Alert | null> {
    const existing = await this.prisma.alert.findFirst({
      where: {
        deviceId: ctx.deviceId,
        type,
        active: true,
      },
    });

    if (existing) {
      return null;
    }

    const alert = await this.prisma.alert.create({
      data: {
        deviceId: ctx.deviceId,
        vehicleId: ctx.vehicleId,
        orderId: ctx.orderId ?? null,
        type,
        severity,
        message: this.messageFor(type, metadata),
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    this.logger.warn(
      `[ALERT] ${type} (${severity}) device=${ctx.deviceId} vehicle=${ctx.vehicleId ?? '-'}`,
    );
    return alert;
  }

  private async resolve(ctx: RuleContext, type: AlertType): Promise<void> {
    await this.prisma.alert.updateMany({
      where: {
        deviceId: ctx.deviceId,
        type,
        active: true,
      },
      data: {
        active: false,
        resolvedAt: new Date(),
      },
    });
  }

  private messageFor(type: AlertType, metadata: Record<string, unknown>) {
    const temp = String(metadata['temperature']);
    const humidity = String(metadata['humidity']);
    const tilt = String(metadata['tilt']);

    switch (type) {
      case 'TEMPERATURE_HIGH':
        return `Температура выше нормы (${temp}°C, макс ${this.tempMax}°C)`;
      case 'TEMPERATURE_LOW':
        return `Температура ниже нормы (${temp}°C, мин ${this.tempMin}°C)`;
      case 'HUMIDITY_HIGH':
        return `Влажность выше нормы (${humidity}%)`;
      case 'HUMIDITY_LOW':
        return `Влажность ниже нормы (${humidity}%)`;
      case 'TILT':
        return `Опасный наклон: ${tilt}° (порог ${this.tiltDegrees}°)`;
      case 'DOOR_OPEN':
        return 'Дверь грузового отсека открыта';
      default:
        return 'Сработало правило безопасности';
    }
  }
}
