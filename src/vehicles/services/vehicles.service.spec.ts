import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { VehiclesService } from './vehicles.service';

describe('VehiclesService', () => {
  const carrierProfileRepositoryMock = {
    findByUserId: jest.fn(),
  };
  const vehiclesRepositoryMock = {
    create: jest.fn(),
    findByCarrierId: jest.fn(),
    findOwnedById: jest.fn(),
    updateOwnedById: jest.fn(),
    deleteOwnedById: jest.fn(),
  };

  const authUser = {
    id: 'user-1',
    email: 'carrier01@caspex.local',
    role: UserRole.CARRIER,
    firstName: 'Alibi',
    lastName: 'Samatov',
    phone: '+77017777777',
    isActive: true,
  };

  const carrierProfile = {
    id: 'carrier-1',
    userId: authUser.id,
    experienceYears: 5,
    transportType: 'ROAD',
    description: null,
    isApproved: false,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  const vehicle = {
    id: 'vehicle-1',
    carrierId: carrierProfile.id,
    type: 'TRUCK',
    brand: 'Volvo',
    model: 'FH16',
    year: 2021,
    plateNumber: '123ABC12',
    capacityTons: 20,
    cargoVolume: 86,
    vehicleImageUrl: null,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  let service: VehiclesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new VehiclesService(
      carrierProfileRepositoryMock as never,
      vehiclesRepositoryMock as never,
    );
  });

  it('creates vehicle for current carrier profile', async () => {
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(carrierProfile);
    vehiclesRepositoryMock.create.mockResolvedValue(vehicle);

    const result = await service.create(authUser, {
      type: 'TRUCK',
      brand: 'Volvo',
      model: 'FH16',
      year: 2021,
      plateNumber: '123ABC12',
      capacityTons: 20,
      cargoVolume: 86,
    });

    expect(vehiclesRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        carrierId: carrierProfile.id,
        plateNumber: '123ABC12',
      }),
    );
    expect(result.vehicle.id).toBe('vehicle-1');
  });

  it('rejects vehicle creation without carrier profile', async () => {
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(null);

    await expect(
      service.create(authUser, {
        type: 'TRUCK',
        brand: 'Volvo',
        model: 'FH16',
        year: 2021,
        plateNumber: '123ABC12',
        capacityTons: 20,
        cargoVolume: 86,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('maps duplicate plate number to conflict', async () => {
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(carrierProfile);
    vehiclesRepositoryMock.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );

    await expect(
      service.create(authUser, {
        type: 'TRUCK',
        brand: 'Volvo',
        model: 'FH16',
        year: 2021,
        plateNumber: '123ABC12',
        capacityTons: 20,
        cargoVolume: 86,
      }),
    ).rejects.toThrow(ConflictException);
  });
});
