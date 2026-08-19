import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TokenService } from '../auth/services/token.service';

type SocketUser = {
  id: string;
  role: string;
};

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  path: '/socket.io',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly tokenService: TokenService) {}

  async handleConnection(client: Socket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.tokenService.verifyAccessToken(token);
      (client.data as { user?: SocketUser }).user = {
        id: payload.sub,
        role: payload.role,
      };
      void client.join('fleet');
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // комнаты socket.io очищаются автоматически
  }

  @SubscribeMessage('subscribe:vehicle')
  handleSubscribeVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id?: string },
  ) {
    if (!data?.id) {
      return;
    }
    void client.join(`vehicle:${data.id}`);
  }

  @SubscribeMessage('subscribe:order')
  handleSubscribeOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { id?: string },
  ) {
    if (!data?.id) {
      return;
    }
    void client.join(`order:${data.id}`);
  }

  emitPosition(vehicleId: string, payload: unknown) {
    this.server
      .to(`vehicle:${vehicleId}`)
      .to('fleet')
      .emit(`position:${vehicleId}`, payload);
  }

  emitOrderUpdate(orderId: string, payload: unknown) {
    this.server
      .to(`order:${orderId}`)
      .to('fleet')
      .emit(`order:${orderId}`, payload);
  }

  emitAlert(payload: unknown) {
    this.server.to('fleet').emit('alert', payload);
  }

  private extractToken(client: Socket): string | null {
    const auth = client.handshake.auth as { token?: string } | undefined;
    if (auth?.token) {
      return auth.token;
    }

    const query = client.handshake.query as { token?: string };
    if (typeof query?.token === 'string' && query.token) {
      return query.token;
    }

    const authorization = client.handshake.headers.authorization;
    if (authorization?.startsWith('Bearer ')) {
      return authorization.slice(7);
    }

    return null;
  }
}

export type { SocketUser };
