import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashPassword } from '../src/common/utils/password.util';

const REQUEST_TIMEOUT_MS = 15_000;
const SUPERADMIN_EMAIL = 'superadmin-e2e@caspex.local';
const CARRIER_EMAIL = 'carrier-e2e@caspex.local';

type RequestTarget = Parameters<typeof request>[0];

function withTimeout<T extends request.Test>(test: T): T {
  return test.timeout({
    response: REQUEST_TIMEOUT_MS,
    deadline: REQUEST_TIMEOUT_MS,
  });
}

function toRequestTarget(value: unknown): RequestTarget {
  if (
    (typeof value !== 'object' || value === null) &&
    typeof value !== 'function'
  ) {
    throw new Error('Invalid http server target');
  }

  return value as RequestTarget;
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} is not an object`);
  }

  return value as Record<string, unknown>;
}

function readString(
  record: Record<string, unknown>,
  key: string,
  label: string,
): string {
  const value = record[key];
  if (typeof value !== 'string') {
    throw new Error(`${label}.${key} must be a string`);
  }

  return value;
}

function readBoolean(
  record: Record<string, unknown>,
  key: string,
  label: string,
): boolean {
  const value = record[key];
  if (typeof value !== 'boolean') {
    throw new Error(`${label}.${key} must be a boolean`);
  }

  return value;
}

async function cleanDatabase(app: INestApplication) {
  const prisma = app.get(PrismaService);

  await prisma.refreshToken.deleteMany({
    where: {
      user: {
        email: {
          in: [SUPERADMIN_EMAIL, CARRIER_EMAIL],
        },
      },
    },
  });

  await prisma.vehicle.deleteMany({
    where: {
      carrier: {
        user: {
          email: CARRIER_EMAIL,
        },
      },
    },
  });

  await prisma.carrierProfile.deleteMany({
    where: {
      user: {
        email: CARRIER_EMAIL,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        in: [SUPERADMIN_EMAIL, CARRIER_EMAIL],
      },
    },
  });
}

async function seedUsers(app: INestApplication) {
  const prisma = app.get(PrismaService);
  const bcryptRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? '12');
  const passwordHash = await hashPassword('CaspXPass_123', bcryptRounds);

  await prisma.user.create({
    data: {
      email: SUPERADMIN_EMAIL,
      passwordHash,
      role: UserRole.SUPERADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+77019999999',
      companyName: 'Caspx',
      city: 'Aktau',
      country: 'Kazakhstan',
    },
  });

  const carrierUser = await prisma.user.create({
    data: {
      email: CARRIER_EMAIL,
      passwordHash,
      role: UserRole.CARRIER,
      firstName: 'Carrier',
      lastName: 'One',
      phone: '+77018888888',
      companyName: 'Carrier LLC',
      city: 'Aktau',
      country: 'Kazakhstan',
    },
  });

  const carrierProfile = await prisma.carrierProfile.create({
    data: {
      userId: carrierUser.id,
      experienceYears: 6,
      transportType: 'ROAD',
      description: 'Regional road carrier',
      isApproved: false,
    },
  });

  await prisma.vehicle.create({
    data: {
      carrierId: carrierProfile.id,
      type: 'TRUCK',
      brand: 'Volvo',
      model: 'FH16',
      year: 2021,
      plateNumber: '123ABC12',
      capacityTons: 20,
      cargoVolume: 86,
      vehicleImageUrl: null,
    },
  });
}

describe('Superadmin carriers/vehicles e2e', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        forbidNonWhitelisted: true,
        transform: true,
        whitelist: true,
      }),
    );
    await app.init();

    await cleanDatabase(app);
    await seedUsers(app);
  });

  it('lists carrier profiles and updates approval', async () => {
    const server = toRequestTarget(app.getHttpServer());

    const loginRes = await withTimeout(
      request(server).post('/auth/login').send({
        email: SUPERADMIN_EMAIL,
        password: 'CaspXPass_123',
      }),
    ).expect(201);

    const loginBody = asRecord(loginRes.body, 'loginRes.body');
    const accessToken = readString(loginBody, 'accessToken', 'loginRes');

    const carriersRes = await withTimeout(
      request(server)
        .get('/superadmin/carriers')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          isApproved: 'false',
          transportType: 'ROAD',
          search: 'Carrier',
          page: 1,
          limit: 25,
        }),
    ).expect(200);

    const carriersBody = asRecord(carriersRes.body, 'carriersRes.body');
    const carriers = carriersBody.carriers;
    if (!Array.isArray(carriers) || carriers.length === 0) {
      throw new Error(
        'carriersRes.body.carriers must contain at least one item',
      );
    }

    const carrierItem = asRecord(carriers[0], 'carriersRes.body.carriers[0]');
    const carrierId = readString(carrierItem, 'id', 'carrierItem');
    const initialApproved = readBoolean(
      carrierItem,
      'isApproved',
      'carrierItem',
    );
    if (initialApproved !== false) {
      throw new Error('carrierItem.isApproved must be false before approval');
    }

    const approvalRes = await withTimeout(
      request(server)
        .patch(`/superadmin/carriers/${carrierId}/approval`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ isApproved: true }),
    ).expect(200);

    const approvalBody = asRecord(approvalRes.body, 'approvalRes.body');
    const approvedCarrier = asRecord(
      approvalBody.carrierProfile,
      'approvalRes.body.carrierProfile',
    );
    const approvedState = readBoolean(
      approvedCarrier,
      'isApproved',
      'approvalRes.body.carrierProfile',
    );
    if (approvedState !== true) {
      throw new Error('approval endpoint did not set isApproved=true');
    }
  });

  it('lists vehicles with filters', async () => {
    const server = toRequestTarget(app.getHttpServer());

    const loginRes = await withTimeout(
      request(server).post('/auth/login').send({
        email: SUPERADMIN_EMAIL,
        password: 'CaspXPass_123',
      }),
    ).expect(201);

    const loginBody = asRecord(loginRes.body, 'loginRes.body');
    const accessToken = readString(loginBody, 'accessToken', 'loginRes');

    const vehiclesRes = await withTimeout(
      request(server)
        .get('/superadmin/vehicles')
        .set('Authorization', `Bearer ${accessToken}`)
        .query({
          type: 'TRUCK',
          brand: 'Volvo',
          plateNumber: '123ABC12',
          search: 'Carrier',
          page: 1,
          limit: 25,
        }),
    ).expect(200);

    const vehiclesBody = asRecord(vehiclesRes.body, 'vehiclesRes.body');
    const vehicles = vehiclesBody.vehicles;
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      throw new Error(
        'vehiclesRes.body.vehicles must contain at least one item',
      );
    }

    const vehicleItem = asRecord(vehicles[0], 'vehiclesRes.body.vehicles[0]');
    const plateNumber = readString(vehicleItem, 'plateNumber', 'vehicleItem');
    if (plateNumber !== '123ABC12') {
      throw new Error('vehicleItem.plateNumber did not match seeded vehicle');
    }
  });

  afterEach(async () => {
    await app.close();
  });
});
