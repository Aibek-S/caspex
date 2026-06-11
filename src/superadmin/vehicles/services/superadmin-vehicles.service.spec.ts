import { SuperadminVehiclesService } from './superadmin-vehicles.service';

describe('SuperadminVehiclesService', () => {
  const prismaMock = {
    vehicle: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const vehicle = {
    id: 'vehicle-1',
    carrierId: 'carrier-1',
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
    carrier: {
      user: {
        email: 'carrier01@caspex.local',
        firstName: 'Alibi',
        lastName: 'Samatov',
      },
    },
  };

  let service: SuperadminVehiclesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SuperadminVehiclesService(prismaMock as never);
  });

  it('lists vehicles', async () => {
    prismaMock.vehicle.findMany.mockResolvedValue([vehicle]);
    prismaMock.vehicle.count.mockResolvedValue(1);

    const result = await service.list({
      page: 1,
      limit: 25,
      search: 'volvo',
    });

    expect(prismaMock.vehicle.findMany).toHaveBeenCalled();
    expect(result.vehicles).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
