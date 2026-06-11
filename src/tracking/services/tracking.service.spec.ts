import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import { TrackingService } from './tracking.service';

describe('TrackingService', () => {
  const prismaMock = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };
  const carrierProfileRepositoryMock = {
    findByUserId: jest.fn(),
  };
  const orderTrackingRepositoryMock = {
    create: jest.fn(),
    findByOrderId: jest.fn(),
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

  const carrierUser = {
    id: 'carrier-user-1',
    email: 'carrier01@caspex.local',
    role: UserRole.CARRIER,
    firstName: 'Alibi',
    lastName: 'Samatov',
    phone: '+77010000002',
    isActive: true,
  };

  const order = {
    id: 'order-1',
    clientId: clientUser.id,
    carrierId: 'carrier-1',
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
    status: OrderStatus.ASSIGNED,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  const trackingEvent = {
    id: 'tracking-1',
    orderId: order.id,
    status: OrderStatus.IN_TRANSIT,
    location: 'Aktau highway',
    timestamp: new Date('2026-06-11T12:30:00.000Z'),
    createdAt: new Date('2026-06-11T12:30:00.000Z'),
  };

  let service: TrackingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrackingService(
      prismaMock as never,
      carrierProfileRepositoryMock as never,
      orderTrackingRepositoryMock as never,
    );
  });

  it('creates tracking event and updates order status for assigned carrier', async () => {
    prismaMock.order.findUnique.mockResolvedValue(order);
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue({
      id: 'carrier-1',
    });
    prismaMock.order.update.mockResolvedValue({
      ...order,
      status: OrderStatus.IN_TRANSIT,
    });
    orderTrackingRepositoryMock.create.mockResolvedValue(trackingEvent);

    const result = await service.createOrderTracking(carrierUser, order.id, {
      status: OrderStatus.IN_TRANSIT,
      location: 'Aktau highway',
    });

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: order.id },
      data: { status: OrderStatus.IN_TRANSIT },
    });
    expect(orderTrackingRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: order.id,
        status: OrderStatus.IN_TRANSIT,
        location: 'Aktau highway',
      }),
    );
    expect(result.tracking.id).toBe(trackingEvent.id);
  });

  it('lists tracking timeline for order owner', async () => {
    prismaMock.order.findUnique.mockResolvedValue(order);
    orderTrackingRepositoryMock.findByOrderId.mockResolvedValue([
      trackingEvent,
    ]);

    const result = await service.getOrderTracking(clientUser, order.id);

    expect(result.orderId).toBe(order.id);
    expect(result.currentStatus).toBe(order.status);
    expect(result.tracking).toHaveLength(1);
  });

  it('hides tracking for unrelated carrier', async () => {
    prismaMock.order.findUnique.mockResolvedValue(order);
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue({
      id: 'another-carrier',
    });

    await expect(
      service.createOrderTracking(carrierUser, order.id, {
        status: OrderStatus.IN_TRANSIT,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects backward tracking transitions', async () => {
    prismaMock.order.findUnique.mockResolvedValue({
      ...order,
      status: OrderStatus.IN_TRANSIT,
    });
    carrierProfileRepositoryMock.findByUserId.mockResolvedValue({
      id: 'carrier-1',
    });

    await expect(
      service.createOrderTracking(carrierUser, order.id, {
        status: OrderStatus.ASSIGNED,
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('throws when order is missing for internal record', async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    await expect(
      service.recordOrderEvent({
        orderId: 'missing-order',
        status: OrderStatus.SEARCHING,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
