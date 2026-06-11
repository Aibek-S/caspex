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
    destination: 'Kuryk',
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
          destination: 'Kuryk',
        },
      ),
    ).rejects.toThrow(ForbiddenException);
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
