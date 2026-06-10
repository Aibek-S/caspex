import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { hashPassword } from '../../common/utils/password.util';
import { SuperadminService } from './superadmin.service';

jest.mock('../../common/utils/password.util', () => ({
  hashPassword: jest.fn(),
}));

describe('SuperadminService', () => {
  const usersRepositoryMock = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  };

  const hashPasswordMock = hashPassword as jest.MockedFunction<
    typeof hashPassword
  >;

  const baseUser = {
    id: 'user-1',
    email: 'admin01@caspex.local',
    passwordHash: 'stored-hash',
    role: UserRole.ADMIN,
    firstName: 'Admin',
    lastName: 'User',
    phone: '+77017777777',
    avatarUrl: null,
    companyName: null,
    companyLogo: null,
    city: null,
    country: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-06-10T10:00:00.000Z'),
    updatedAt: new Date('2026-06-10T10:00:00.000Z'),
  };

  let service: SuperadminService;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    originalEnv = process.env;
    process.env = {
      ...originalEnv,
      BCRYPT_SALT_ROUNDS: '12',
    };
    service = new SuperadminService(usersRepositoryMock as never);
    hashPasswordMock.mockResolvedValue('new-password-hash');
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('creates user with selected role', async () => {
    usersRepositoryMock.findByEmail.mockResolvedValue(null);
    usersRepositoryMock.create.mockResolvedValue(baseUser);

    const result = await service.createUser({
      email: 'admin01@caspex.local',
      password: 'CaspXPass_123',
      role: UserRole.ADMIN,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+77017777777',
    });

    expect(usersRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'admin01@caspex.local',
        passwordHash: 'new-password-hash',
        role: UserRole.ADMIN,
      }),
    );
    expect(result.user.email).toBe('admin01@caspex.local');
  });

  it('rejects duplicate email on create', async () => {
    usersRepositoryMock.findByEmail.mockResolvedValue(baseUser);

    await expect(
      service.createUser({
        email: 'admin01@caspex.local',
        password: 'CaspXPass_123',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+77017777777',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('prevents superadmin from demoting own account', async () => {
    usersRepositoryMock.findById.mockResolvedValue({
      ...baseUser,
      id: 'superadmin-1',
      role: UserRole.SUPERADMIN,
    });

    await expect(
      service.updateUserRole(
        {
          id: 'superadmin-1',
          email: 'superadmin@caspex.local',
          role: UserRole.SUPERADMIN,
          firstName: 'CaspX',
          lastName: 'Superadmin',
          phone: '+77010000000',
          isActive: true,
        },
        'superadmin-1',
        { role: UserRole.ADMIN },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('bootstraps superadmin from env when missing', async () => {
    process.env.NODE_ENV = 'development';
    process.env.SUPERADMIN_EMAIL = 'superadmin@caspex.local';
    process.env.SUPERADMIN_PASSWORD = 'CaspXSuperAdmin_123';
    process.env.SUPERADMIN_FIRST_NAME = 'CaspX';
    process.env.SUPERADMIN_LAST_NAME = 'Superadmin';
    process.env.SUPERADMIN_PHONE = '+77010000000';

    usersRepositoryMock.findByEmail.mockResolvedValue(null);
    usersRepositoryMock.create.mockResolvedValue({
      ...baseUser,
      role: UserRole.SUPERADMIN,
    });

    await service.onApplicationBootstrap();

    expect(usersRepositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'superadmin@caspex.local',
        passwordHash: 'new-password-hash',
        role: UserRole.SUPERADMIN,
      }),
    );
  });
});
