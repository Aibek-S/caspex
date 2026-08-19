import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Device, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { DevicesRepository } from '../repositories/devices.repository';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

@Injectable()
export class DevicesService {
  constructor(private readonly devicesRepository: DevicesRepository) {}

  async create(dto: CreateDeviceDto) {
    const deviceKey = `dev_${randomBytes(8).toString('hex')}`;
    const apiKey = `sk_casp_${randomBytes(24).toString('hex')}`;
    const apiKeyHash = await bcrypt.hash(apiKey, SALT_ROUNDS);

    try {
      const device = await this.devicesRepository.create({
        name: dto.name,
        deviceKey,
        apiKeyHash,
        type: dto.type,
        vehicleId: dto.vehicleId ?? null,
        firmware: dto.firmware ?? null,
      });

      return {
        device: {
          ...this.toDeviceResponse(device),
          apiKey,
        },
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Device key collision, retry');
      }

      throw error;
    }
  }

  async list() {
    const devices = await this.devicesRepository.list();
    return { devices: devices.map((device) => this.toDeviceResponse(device)) };
  }

  async getById(id: string) {
    const device = await this.devicesRepository.findById(id);
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    return { device: this.toDeviceResponse(device) };
  }

  async update(id: string, dto: UpdateDeviceDto) {
    const existing = await this.devicesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Device not found');
    }

    const data: Prisma.DeviceUpdateInput = {
      name: dto.name,
      type: dto.type,
      firmware: dto.firmware,
      isActive: dto.isActive,
    };

    if (dto.vehicleId !== undefined) {
      data.vehicle = dto.vehicleId
        ? { connect: { id: dto.vehicleId } }
        : { disconnect: true };
    }

    const device = await this.devicesRepository.update(id, data);

    return { device: this.toDeviceResponse(device) };
  }

  async delete(id: string) {
    const existing = await this.devicesRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Device not found');
    }

    const device = await this.devicesRepository.delete(id);
    return { device: this.toDeviceResponse(device) };
  }

  private toDeviceResponse(device: Device) {
    return {
      id: device.id,
      name: device.name,
      deviceKey: device.deviceKey,
      type: device.type,
      vehicleId: device.vehicleId,
      isActive: device.isActive,
      firmware: device.firmware,
      lastSeenAt: device.lastSeenAt,
      lastLatitude: device.lastLatitude,
      lastLongitude: device.lastLongitude,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    };
  }
}
