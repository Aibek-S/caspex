import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CarrierService } from './carrier.service';

describe('CarrierService', () => {
  const carrierProfileRepositoryMock = {
    findByUserId: jest.fn(),
    create: jest.fn(),
    updateByUserId: jest.fn(),
  };
  const usersRepositoryMock = {
    update: jest.fn(),
  };

  const authUser = {
    id: 'user-1',
    email: 'client01@caspex.local',
    role: UserRole.CLIENT,
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
    description: 'Truck carrier',
    isApproved: false,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  let service: CarrierService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CarrierService(
      carrierProfileRepositoryMock as never,
      usersRepositoryMock as never,
    );
  });

  it('creates carrier profile and upgrades client role', async () => {
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(null);
    carrierProfileRepositoryMock.create.mockResolvedValue(carrierProfile);

    const result = await service.apply(authUser, {
      experienceYears: 5,
      transportType: 'ROAD',
      description: 'Truck carrier',
    });

    expect(carrierProfileRepositoryMock.create).toHaveBeenCalledWith({
      userId: authUser.id,
      experienceYears: 5,
      transportType: 'ROAD',
      description: 'Truck carrier',
    });
    expect(usersRepositoryMock.update).toHaveBeenCalledWith(authUser.id, {
      role: UserRole.CARRIER,
    });
    expect(result.carrierProfile.id).toBe('carrier-1');
  });

  it('rejects duplicate carrier profile', async () => {
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(carrierProfile);

    await expect(
      service.apply(authUser, {
        experienceYears: 5,
        transportType: 'ROAD',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('rejects profile read when carrier profile is missing', async () => {
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(null);

    await expect(service.getProfile(authUser)).rejects.toThrow(
      NotFoundException,
    );
  });
});
