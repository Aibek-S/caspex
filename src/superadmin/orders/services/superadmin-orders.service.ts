import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { ListSuperadminOrdersQueryDto } from '../dto/list-superadmin-orders-query.dto';
import { UpdateSuperadminOrderDto } from '../dto/update-superadmin-order.dto';

@Injectable()
export class SuperadminOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListSuperadminOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: this.includeRelations(),
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => this.toItem(order)),
      meta: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async getById(orderId: string) {
    const order = await this.findByIdOrThrow(orderId);
    return { order: this.toItem(order) };
  }

  async update(orderId: string, dto: UpdateSuperadminOrderDto) {
    await this.findByIdOrThrow(orderId);

    const order = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        title: dto.title,
        cargoType: dto.cargoType,
        weight: dto.weight,
        volume: dto.volume,
        origin: dto.origin,
        destination: dto.destination,
        comment: dto.comment,
        estimatedPrice: dto.estimatedPrice,
        estimatedDeliveryTime: dto.estimatedDeliveryTime,
        estimatedCarrierSearchTime: dto.estimatedCarrierSearchTime,
        status: dto.status,
        carrier:
          dto.carrierId === undefined
            ? undefined
            : dto.carrierId
              ? { connect: { id: dto.carrierId } }
              : { disconnect: true },
      },
      include: this.includeRelations(),
    });

    return { order: this.toItem(order) };
  }

  async delete(orderId: string) {
    await this.findByIdOrThrow(orderId);

    const order = await this.prisma.order.delete({
      where: { id: orderId },
      include: this.includeRelations(),
    });

    return { order: this.toItem(order) };
  }

  private buildWhere(
    query: ListSuperadminOrdersQueryDto,
  ): Prisma.OrderWhereInput {
    return {
      clientId: query.clientId,
      carrierId: query.carrierId,
      status: query.status,
      cargoType: query.cargoType,
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { cargoType: { contains: query.search, mode: 'insensitive' } },
              { origin: { contains: query.search, mode: 'insensitive' } },
              { destination: { contains: query.search, mode: 'insensitive' } },
              { comment: { contains: query.search, mode: 'insensitive' } },
              {
                client: {
                  OR: [
                    { email: { contains: query.search, mode: 'insensitive' } },
                    {
                      firstName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                    {
                      lastName: {
                        contains: query.search,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
              {
                carrier: {
                  user: {
                    OR: [
                      {
                        email: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        firstName: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                      {
                        lastName: {
                          contains: query.search,
                          mode: 'insensitive',
                        },
                      },
                    ],
                  },
                },
              },
            ],
          }
        : {}),
    };
  }

  private async findByIdOrThrow(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.includeRelations(),
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private includeRelations() {
    return {
      client: true,
      carrier: {
        include: {
          user: true,
        },
      },
    } satisfies Prisma.OrderInclude;
  }

  private toItem(
    order: Prisma.OrderGetPayload<{
      include: ReturnType<SuperadminOrdersService['includeRelations']>;
    }>,
  ) {
    return {
      id: order.id,
      clientId: order.clientId,
      carrierId: order.carrierId,
      title: order.title,
      cargoType: order.cargoType,
      weight: order.weight,
      volume: order.volume,
      origin: order.origin,
      destination: order.destination,
      comment: order.comment,
      estimatedPrice: order.estimatedPrice,
      estimatedDeliveryTime: order.estimatedDeliveryTime,
      estimatedCarrierSearchTime: order.estimatedCarrierSearchTime,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      clientEmail: order.client.email,
      clientFirstName: order.client.firstName,
      clientLastName: order.client.lastName,
      carrierEmail: order.carrier?.user.email ?? null,
      carrierFirstName: order.carrier?.user.firstName ?? null,
      carrierLastName: order.carrier?.user.lastName ?? null,
    };
  }
}
