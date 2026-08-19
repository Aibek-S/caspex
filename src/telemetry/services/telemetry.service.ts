import { Injectable } from '@nestjs/common';
import { TelemetryRepository } from '../repositories/telemetry.repository';

@Injectable()
export class TelemetryService {
  constructor(private readonly telemetryRepository: TelemetryRepository) {}

  async listByVehicle(vehicleId: string, limit?: number) {
    const safeLimit = Math.min(Math.max(Number(limit) || 100, 1), 1000);
    const readings = await this.telemetryRepository.findByVehicle(
      vehicleId,
      safeLimit,
    );

    return { readings };
  }

  async latestByVehicle(vehicleId: string) {
    const reading =
      await this.telemetryRepository.findLatestByVehicle(vehicleId);

    return { reading };
  }
}
