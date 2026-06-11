import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole, OrderStatus } from '@prisma/client';
import { unlink } from 'fs/promises';
import { UploadsService } from './uploads.service';

jest.mock('fs/promises', () => ({
  unlink: jest.fn(),
}));

describe('UploadsService', () => {
  const usersRepositoryMock = {
    findById: jest.fn(),
    update: jest.fn(),
  };
  const ordersRepositoryMock = {
    findById: jest.fn(),
  };
  const prismaMock = {
    order: {
      update: jest.fn(),
    },
  };

  const authUser = {
    id: 'user-1',
    email: 'client01@caspex.local',
    role: UserRole.CLIENT,
    firstName: 'Ayan',
    lastName: 'Serikov',
    phone: '+77010000001',
    isActive: true,
  };

  const user = {
    id: authUser.id,
    email: authUser.email,
    role: authUser.role,
    passwordHash: 'hash',
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    phone: authUser.phone,
    avatarUrl: 'https://api-angels.byapex.dev/uploads/avatars/old.jpg',
    companyName: null,
    companyLogo: null,
    city: 'Aktau',
    country: 'Kazakhstan',
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  const order = {
    id: 'order-1',
    clientId: authUser.id,
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
    cargoPhotoUrl: 'https://api-angels.byapex.dev/uploads/cargo/old.jpg',
    productPhotoUrls: ['https://api-angels.byapex.dev/uploads/products/a.jpg'],
    comment: null,
    estimatedPrice: null,
    estimatedDeliveryTime: null,
    estimatedCarrierSearchTime: null,
    status: OrderStatus.SEARCHING,
    createdAt: new Date('2026-06-11T10:00:00.000Z'),
    updatedAt: new Date('2026-06-11T10:00:00.000Z'),
  };

  let service: UploadsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UploadsService(
      usersRepositoryMock as never,
      ordersRepositoryMock as never,
      prismaMock as never,
    );
  });

  it('updates avatar url and removes old local avatar file', async () => {
    usersRepositoryMock.findById.mockResolvedValue(user);
    usersRepositoryMock.update.mockResolvedValue({
      ...user,
      avatarUrl: 'https://api-angels.byapex.dev/uploads/avatars/new.jpg',
    });

    const result = await service.attachAvatar(
      authUser,
      'https://api-angels.byapex.dev/uploads/avatars/new.jpg',
    );

    expect(unlink).toHaveBeenCalled();
    expect(usersRepositoryMock.update).toHaveBeenCalledWith(authUser.id, {
      avatarUrl: 'https://api-angels.byapex.dev/uploads/avatars/new.jpg',
    });
    expect(result.url).toBe(
      'https://api-angels.byapex.dev/uploads/avatars/new.jpg',
    );
  });

  it('updates cargo photo url for own order', async () => {
    ordersRepositoryMock.findById.mockResolvedValue(order);
    prismaMock.order.update.mockResolvedValue({
      ...order,
      cargoPhotoUrl: 'https://api-angels.byapex.dev/uploads/cargo/new.jpg',
    });

    const result = await service.attachCargoPhoto(
      authUser,
      order.id,
      'https://api-angels.byapex.dev/uploads/cargo/new.jpg',
    );

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: order.id },
      data: {
        cargoPhotoUrl: 'https://api-angels.byapex.dev/uploads/cargo/new.jpg',
      },
    });
    expect(result.order.cargoPhotoUrl).toBe(
      'https://api-angels.byapex.dev/uploads/cargo/new.jpg',
    );
  });

  it('appends product photo url for own order', async () => {
    ordersRepositoryMock.findById.mockResolvedValue(order);
    prismaMock.order.update.mockResolvedValue({
      ...order,
      productPhotoUrls: [
        ...order.productPhotoUrls,
        'https://api-angels.byapex.dev/uploads/products/b.jpg',
      ],
    });

    const result = await service.attachProductPhoto(
      authUser,
      order.id,
      'https://api-angels.byapex.dev/uploads/products/b.jpg',
    );

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: order.id },
      data: {
        productPhotoUrls: [
          ...order.productPhotoUrls,
          'https://api-angels.byapex.dev/uploads/products/b.jpg',
        ],
      },
    });
    expect(result.order.productPhotoUrls).toHaveLength(2);
  });

  it('throws not found when order is missing', async () => {
    ordersRepositoryMock.findById.mockResolvedValue(null);

    await expect(
      service.attachCargoPhoto(
        authUser,
        'missing-order',
        'https://api-angels.byapex.dev/uploads/cargo/new.jpg',
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws forbidden when order belongs to another user', async () => {
    ordersRepositoryMock.findById.mockResolvedValue({
      ...order,
      clientId: 'another-user',
    });

    await expect(
      service.attachProductPhoto(
        authUser,
        order.id,
        'https://api-angels.byapex.dev/uploads/products/new.jpg',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});
