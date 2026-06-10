import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { TokenService } from './token.service';

describe('TokenService', () => {
  const envBackup = { ...process.env };
  const jwtServiceMock = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  let service: TokenService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
    process.env.JWT_ACCESS_TTL = '15m';
    process.env.JWT_REFRESH_TTL = '7d';
    service = new TokenService(jwtServiceMock as never);
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('issues access and refresh token pair', async () => {
    jwtServiceMock.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.issueTokenPair({
      userId: 'user-1',
      role: UserRole.CLIENT,
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        sub: 'user-1',
        role: UserRole.CLIENT,
        tokenType: 'access',
      }),
      expect.objectContaining({
        secret: 'test-access-secret',
      }),
    );
    expect(jwtServiceMock.signAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        sub: 'user-1',
        tokenType: 'refresh',
      }),
      expect.objectContaining({
        secret: 'test-refresh-secret',
      }),
    );
  });

  it('throws UnauthorizedException when access token has wrong tokenType', async () => {
    jwtServiceMock.verifyAsync.mockResolvedValue({
      sub: 'user-1',
      tokenType: 'refresh',
    });

    await expect(service.verifyAccessToken('bad-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('wraps jwt verify errors for refresh token', async () => {
    jwtServiceMock.verifyAsync.mockRejectedValue(new Error('jwt expired'));

    await expect(service.verifyRefreshToken('expired-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );
  });
});
