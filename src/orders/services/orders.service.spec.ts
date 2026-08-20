import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const ordersRepositoryMock = {
    create: jest.fn(),
    findById: jest.fn(),
    findManyForUser: jest.fn(),
    findAvailable: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const carrierProfileRepositoryMock = {
    findByUserId: jest.fn(),
  };
  const trackingServiceMock = {
    recordOrderEvent: jest.fn(),
  };
  const settlementsServiceMock = {
    findOne: jest.fn(),
  };
  const routesServiceMock = {
    calculateForOrder: jest.fn(),
  };
  const prismaServiceMock = {
    route: { findFirst: jest.fn() },
    telemetryReading: { findFirst: jest.fn() },
    alert: { findMany: jest.fn() },
  };

  const clientUser = {
    id: 'client-1',
    email: 'client01@caspex.local',
    role: UserRole.CLIENT,
    firstName: 'Ayan',
    lastName: 'Serikov',
    phone: '+77010000001',
    isActive: true,
  };

  const order = {
    id: 'order-1',
    clientId: clientUser.id,
    carrierId: null,
    title: 'Transport cargo',
    cargoType: 'GENERAL',
    weight: 12,
    volume: 40,
    origin: 'Aktau',
    originCity: 'Aktau',
    originCountry: 'Kazakhstan',
    destination: 'Kuryk',
    destinationCity: 'Kuryk',
    destinationCountry: 'Kazakhstan',
    originLat: 43.6532,
    originLng: 51.1975,
    destinationLat: 43.1789,
    destinationLng: 51.6814,
    cargoPhotoUrl: 'https://cdn.example.com/orders/cargo-photo.jpg',
    productPhotoUrls: ['https://cdn.example.com/orders/photo-1.jpg'],
    comment: null,
    estimatedPrice: 100000,
    estimatedDeliveryTime: 8,
    estimatedCarrierSearchTime: 120,
    status: OrderStatus.SEARCHING,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  let service: OrdersService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OrdersService(
      ordersRepositoryMock as never,
      carrierProfileRepositoryMock as never,
      trackingServiceMock as never,
      prismaServiceMock as never,
      settlementsServiceMock as never,
      routesServiceMock as never,
    );
  });

  it('creates order for current client', async () => {
    ordersRepositoryMock.create.mockResolvedValue(order);

    const result = await service.create(clientUser, {
      title: 'Transport cargo',
      cargoType: 'GENERAL',
      weight: 12,
      volume: 40,
      origin: 'Aktau',
      destination: 'Kuryk',
      originLat: 43.6532,
      originLng: 51.1975,
      destinationLat: 43.1789,
      destinationLng: 51.6814,
      estimatedPrice: 100000,
      estimatedDeliveryTime: 8,
      estimatedCarrierSearchTime: 120,
    });

    expect(ordersRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        clientId: clientUser.id,
        status: OrderStatus.SEARCHING,
      }),
    );
    expect(trackingServiceMock.recordOrderEvent).toHaveBeenCalledWith({
      orderId: order.id,
      status: OrderStatus.SEARCHING,
      location: order.origin,
    });
    expect(result.order.id).toBe(order.id);
  });

  it('rejects admin order creation', async () => {
    await expect(
      service.create(
        {
          ...clientUser,
          role: UserRole.ADMIN,
        },
        {
          title: 'Transport cargo',
          cargoType: 'GENERAL',
          weight: 12,
          volume: 40,
          origin: 'Aktau',
          originCity: 'Aktau',
          originCountry: 'Kazakhstan',
          destination: 'Kuryk',
          destinationCity: 'Kuryk',
          destinationCountry: 'Kazakhstan',
          originLat: 43.6532,
          originLng: 51.1975,
          destinationLat: 43.1789,
          destinationLng: 51.6814,
        },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('resolves coordinates from selected settlements', async () => {
    settlementsServiceMock.findOne
      .mockResolvedValueOnce({
        settlement: {
          id: 'aktau',
          name: 'Aktau',
          latitude: 43.65,
          longitude: 51.16,
        },
      })
      .mockResolvedValueOnce({
        settlement: {
          id: 'kuryk',
          name: 'Kuryk',
          latitude: 42.49,
          longitude: 51.68,
        },
      });
    ordersRepositoryMock.create.mockResolvedValue(order);

    await service.create(clientUser, {
      title: 'Regional shipment',
      cargoType: 'GENERAL',
      weight: 12,
      volume: 40,
      originSettlementId: 'aktau',
      destinationSettlementId: 'kuryk',
    });

    expect(ordersRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: 'Aktau',
        originSettlementId: 'aktau',
        originLat: 43.65,
        destination: 'Kuryk',
        destinationSettlementId: 'kuryk',
        destinationLng: 51.68,
      }),
    );
  });

  it('adds route ETA when route calculation succeeds', async () => {
    ordersRepositoryMock.create.mockResolvedValue(order);
    routesServiceMock.calculateForOrder.mockResolvedValue({
      id: 'route-1',
      orderId: order.id,
      distanceKm: 141.4,
      durationMinutes: 141,
      geometry: { type: 'LineString', coordinates: [] },
      createdAt: new Date(),
    });
    ordersRepositoryMock.update.mockResolvedValue({
      ...order,
      estimatedDeliveryTime: 3,
    });

    const result = await service.create(clientUser, {
      title: 'Transport cargo',
      cargoType: 'GENERAL',
      weight: 12,
      volume: 40,
      origin: 'Aktau',
      destination: 'Kuryk',
      originLat: 43.65,
      originLng: 51.16,
      destinationLat: 42.49,
      destinationLng: 51.68,
    });

    expect(routesServiceMock.calculateForOrder).toHaveBeenCalledWith(order);
    expect(ordersRepositoryMock.update).toHaveBeenCalledWith(order.id, {
      estimatedDeliveryTime: 3,
    });
    expect(result.routeCalculated).toBe(true);
  });

  it('creates the order when route calculation is unavailable', async () => {
    ordersRepositoryMock.create.mockResolvedValue(order);
    routesServiceMock.calculateForOrder.mockRejectedValue(
      new Error('OpenRouteService is unavailable'),
    );

    const result = await service.create(clientUser, {
      title: 'Transport cargo',
      cargoType: 'GENERAL',
      weight: 12,
      volume: 40,
      origin: 'Aktau',
      destination: 'Kuryk',
      originLat: 43.65,
      originLng: 51.16,
      destinationLat: 42.49,
      destinationLng: 51.68,
    });

    expect(result).toEqual({
      order,
      route: null,
      routeCalculated: false,
    });
    expect(ordersRepositoryMock.update).not.toHaveBeenCalled();
  });

  it('hides unrelated orders', async () => {
    ordersRepositoryMock.findById.mockResolvedValue({
      ...order,
      clientId: 'another-client',
    });
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue(null);

    await expect(service.getById(clientUser, order.id)).rejects.toThrow(
      NotFoundException,
    );
  });
});
