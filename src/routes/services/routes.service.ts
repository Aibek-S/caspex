import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Order, UserRole } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { CarrierProfileRepository } from '../../carrier/repositories/carrier-profile.repository';
import type { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';
import { CalculateRouteDto } from '../dto/calculate-route.dto';
import { RoutesRepository } from '../repositories/routes.repository';

type Coordinates = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
};

type OrsDirectionsResponse = {
  features?: Array<{
    geometry?: {
      type?: string;
      coordinates?: number[][];
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
    };
  }>;
};

@Injectable()
export class RoutesService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly carrierProfileRepository: CarrierProfileRepository,
    private readonly routesRepository: RoutesRepository,
  ) {}

  async calculate(authUser: AuthUser, dto: CalculateRouteDto) {
    const order = dto.orderId
      ? await this.findVisibleOrderOrThrow(authUser, dto.orderId)
      : null;
    const coords = this.resolveCoordinates(dto, order);
    const orsResponse = await this.requestRoute(coords);
    const parsed = this.parseRouteResponse(orsResponse);

    const route = await this.routesRepository.create({
      orderId: order?.id ?? null,
      distanceKm: parsed.distanceKm,
      durationMinutes: parsed.durationMinutes,
      geometry: parsed.geometry,
    });

    return {
      routeId: route.id,
      orderId: route.orderId,
      distanceKm: route.distanceKm,
      durationMinutes: route.durationMinutes,
      geometry: parsed.geometry,
    };
  }

  private resolveCoordinates(
    dto: CalculateRouteDto,
    order: Pick<
      Order,
      'originLat' | 'originLng' | 'destinationLat' | 'destinationLng'
    > | null,
  ): Coordinates {
    const startLat = dto.startLat ?? order?.originLat ?? undefined;
    const startLng = dto.startLng ?? order?.originLng ?? undefined;
    const endLat = dto.endLat ?? order?.destinationLat ?? undefined;
    const endLng = dto.endLng ?? order?.destinationLng ?? undefined;

    if (
      startLat === undefined ||
      startLng === undefined ||
      endLat === undefined ||
      endLng === undefined
    ) {
      throw new BadRequestException(
        'Route coordinates are required. Provide start/end coordinates or an order with saved coordinates.',
      );
    }

    return { startLat, startLng, endLat, endLng };
  }

  private async requestRoute(coords: Coordinates) {
    const apiKey = process.env.OPENROUTESERVICE_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPENROUTESERVICE_API_KEY is not configured',
      );
    }

    const baseUrl =
      process.env.OPENROUTESERVICE_BASE_URL?.replace(/\/$/, '') ??
      'https://api.openrouteservice.org';
    const endpoint = `${baseUrl}/v2/directions/driving-car/geojson`;

    try {
      const response = await firstValueFrom(
        this.httpService.post<OrsDirectionsResponse>(
          endpoint,
          {
            coordinates: [
              [coords.startLng, coords.startLat],
              [coords.endLng, coords.endLat],
            ],
          },
          {
            headers: {
              Authorization: apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          },
        ),
      );

      return response.data;
    } catch {
      throw new BadGatewayException('OpenRouteService request failed');
    }
  }

  private parseRouteResponse(data: OrsDirectionsResponse) {
    const feature = data.features?.[0];
    const geometry = feature?.geometry;
    const summary = feature?.properties?.summary;

    if (
      !geometry ||
      geometry.type !== 'LineString' ||
      !Array.isArray(geometry.coordinates) ||
      typeof summary?.distance !== 'number' ||
      typeof summary?.duration !== 'number'
    ) {
      throw new BadGatewayException(
        'OpenRouteService returned an invalid route payload',
      );
    }

    return {
      distanceKm: Number((summary.distance / 1000).toFixed(2)),
      durationMinutes: Number((summary.duration / 60).toFixed(2)),
      geometry: {
        type: geometry.type,
        coordinates: geometry.coordinates,
      },
    };
  }

  private async findVisibleOrderOrThrow(authUser: AuthUser, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (authUser.role === UserRole.SUPERADMIN) {
      return order;
    }

    if (order.clientId === authUser.id) {
      return order;
    }

    if (await this.isAssignedCarrier(authUser.id, order)) {
      return order;
    }

    throw new NotFoundException('Order not found');
  }

  private async isAssignedCarrier(userId: string, order: Order) {
    if (!order.carrierId) {
      return false;
    }

    const carrierProfile =
      await this.carrierProfileRepository.findByUserId(userId);
    return carrierProfile?.id === order.carrierId;
  }
}
