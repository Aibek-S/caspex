import { NotFoundException } from '@nestjs/common';
import { SuperadminCarriersService } from './superadmin-carriers.service';

describe('SuperadminCarriersService', () => {
  const prismaMock = {
    carrierProfile: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const carrierProfile = {
    id: 'carrier-1',
    userId: 'user-1',
    experienceYears: 5,
    transportType: 'ROAD',
    description: 'Regional carrier',
    isApproved: false,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
    user: {
      id: 'user-1',
      email: 'carrier01@caspex.local',
      role: 'CARRIER',
      firstName: 'Alibi',
      lastName: 'Samatov',
      phone: '+77017777777',
      avatarUrl: null,
      companyName: null,
      companyLogo: null,
      city: null,
      country: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-06-11T10:00:00.000Z'),
      updatedAt: new Date('2026-06-11T10:00:00.000Z'),
    },
    _count: {
      vehicles: 2,
    },
  };

  let service: SuperadminCarriersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SuperadminCarriersService(prismaMock as never);
  });

  it('lists carrier profiles', async () => {
    prismaMock.carrierProfile.findMany.mockResolvedValue([carrierProfile]);
    prismaMock.carrierProfile.count.mockResolvedValue(1);

    const result = await service.list({
      page: 1,
      limit: 25,
      search: 'aktau',
    });

    expect(prismaMock.carrierProfile.findMany).toHaveBeenCalled();
    expect(result.carriers).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('throws when carrier profile is missing on approval update', async () => {
    prismaMock.carrierProfile.findUnique.mockResolvedValue(null);

    await expect(
      service.setApproval('missing', { isApproved: true }),
    ).rejects.toThrow(NotFoundException);
  });
});
