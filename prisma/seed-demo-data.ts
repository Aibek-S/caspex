import 'dotenv/config';
import { PrismaClient, OrderStatus, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { resolveMangystauDistance } from './mangystau-distance';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const clients = [
  {
    email: 'aktau-logistics@mail.kz',
    firstName: 'Асхат',
    lastName: 'Нурланов',
    company: 'ТОО Aktau Logistics',
    city: 'Aktau',
    phone: '+77011112233',
  },
  {
    email: 'shetpe-trade@mail.kz',
    firstName: 'Дамир',
    lastName: 'Сериков',
    company: 'ТОО Shetpe Trade',
    city: 'Shetpe',
    phone: '+77022223344',
  },
  {
    email: 'aktau-shipping@mail.kz',
    firstName: 'Марат',
    lastName: 'Кусаинов',
    company: 'ТОО Aktau Shipping',
    city: 'Aktau',
    phone: '+77033334455',
  },
  {
    email: 'zhanaozen-food@mail.kz',
    firstName: 'Бахыт',
    lastName: 'Омаров',
    company: 'ТОО Zhanaozen Food Supply',
    city: 'Zhanaozen',
    phone: '+77044445566',
  },
  {
    email: 'zhetybai-auto@mail.kz',
    firstName: 'Сергей',
    lastName: 'Иванов',
    company: 'ТОО Zhetybai Auto Parts',
    city: 'Zhetybai',
    phone: '+77055556677',
  },
  {
    email: 'kuryk-oil@mail.kz',
    firstName: 'Руслан',
    lastName: 'Ермеков',
    company: 'ТОО Kuryk Fuel Supply',
    city: 'Kuryk',
    phone: '+77066667788',
  },
  {
    email: 'beineu-grain@mail.kz',
    firstName: 'Виктор',
    lastName: 'Фёдоров',
    company: 'ТОО Beineu Grain Supply',
    city: 'Beineu',
    phone: '+77077778899',
  },
  {
    email: 'aktau-industrial@mail.kz',
    firstName: 'Алексей',
    lastName: 'Козлов',
    company: 'ТОО Aktau Industrial Supply',
    city: 'Aktau',
    phone: '+77088889900',
  },
];

const carriers = [
  {
    email: 'fort-shevchenko-carrier@mail.kz',
    firstName: 'Ержан',
    lastName: 'Сагынтаев',
    company: 'ТОО Fort-Shevchenko Trans',
    city: 'Fort-Shevchenko',
    phone: '+77099990011',
    transportType: 'truck',
    experienceYears: 8,
  },
  {
    email: 'shetpe-express@mail.kz',
    firstName: 'Талгат',
    lastName: 'Муратов',
    company: 'Shetpe Express',
    city: 'Shetpe',
    phone: '+77099990022',
    transportType: 'truck',
    experienceYears: 12,
  },
  {
    email: 'caspian-logistics@mail.kz',
    firstName: 'Азамат',
    lastName: 'Беков',
    company: 'Caspian Logistics',
    city: 'Aktau',
    phone: '+77099990033',
    transportType: 'truck',
    experienceYears: 5,
  },
  {
    email: 'mangystau-cargo@mail.kz',
    firstName: 'Нурлан',
    lastName: 'Ашимов',
    company: 'Mangystau Cargo',
    city: 'Zhanaozen',
    phone: '+77099990044',
    transportType: 'truck',
    experienceYears: 15,
  },
  {
    email: 'beineu-freight@mail.kz',
    firstName: 'Димаш',
    lastName: 'Кунанбаев',
    company: 'Beineu Freight',
    city: 'Beineu',
    phone: '+77099990055',
    transportType: 'truck',
    experienceYears: 3,
  },
];

const vehiclesData = [
  {
    brand: 'Volvo',
    model: 'FH16',
    year: 2022,
    plateNumber: '001AAA01',
    capacityTons: 20,
    cargoVolume: 82,
  },
  {
    brand: 'Scania',
    model: 'R500',
    year: 2023,
    plateNumber: '002BBB01',
    capacityTons: 22,
    cargoVolume: 86,
  },
  {
    brand: 'MAN',
    model: 'TGX',
    year: 2021,
    plateNumber: '003CCC01',
    capacityTons: 18,
    cargoVolume: 78,
  },
  {
    brand: 'Mercedes-Benz',
    model: 'Actros',
    year: 2023,
    plateNumber: '004DDD01',
    capacityTons: 24,
    cargoVolume: 90,
  },
  {
    brand: 'DAF',
    model: 'XF',
    year: 2022,
    plateNumber: '005EEE01',
    capacityTons: 20,
    cargoVolume: 82,
  },
  {
    brand: 'KamAZ',
    model: '6520',
    year: 2020,
    plateNumber: '006FFF01',
    capacityTons: 14,
    cargoVolume: 60,
  },
  {
    brand: 'Volvo',
    model: 'FH',
    year: 2021,
    plateNumber: '007GGG01',
    capacityTons: 20,
    cargoVolume: 82,
  },
];

async function main() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? '12');

  // Remove the legacy non-regional demo carrier left by older seed versions.
  const removedLegacyCarrier = await prisma.user.deleteMany({
    where: { email: 'dostyk-carrier@mail.kz' },
  });
  if (removedLegacyCarrier.count > 0) {
    console.log(
      `Removed ${removedLegacyCarrier.count} legacy Dostyk demo carrier`,
    );
  }

  // ── Clients ─────────────────────────────────────────────
  console.log('Creating clients...');
  let clientCount = 0;
  for (const c of clients) {
    const existing = await prisma.user.findUnique({
      where: { email: c.email },
    });
    if (existing) continue;
    await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: await bcrypt.hash('Client_123', saltRounds),
        role: UserRole.CLIENT,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        companyName: c.company,
        city: c.city,
        country: 'Kazakhstan',
        isActive: true,
      },
    });
    clientCount++;
  }
  console.log(`  Created ${clientCount} clients`);

  // ── Carriers ────────────────────────────────────────────
  console.log('Creating carriers...');
  let carrierCount = 0;
  const carrierUserIds: string[] = [];

  for (const c of carriers) {
    const existing = await prisma.user.findUnique({
      where: { email: c.email },
    });
    if (existing) {
      carrierUserIds.push(existing.id);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        email: c.email,
        passwordHash: await bcrypt.hash('Carrier_123', saltRounds),
        role: UserRole.CARRIER,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        companyName: c.company,
        city: c.city,
        country: 'Kazakhstan',
        isActive: true,
      },
    });

    await prisma.carrierProfile.create({
      data: {
        userId: user.id,
        transportType: c.transportType,
        experienceYears: c.experienceYears,
        isApproved: true,
        description: `Опытный перевозчик из ${c.city}`,
      },
    });

    carrierUserIds.push(user.id);
    carrierCount++;
  }
  console.log(`  Created ${carrierCount} carriers`);

  // ── Vehicles ────────────────────────────────────────────
  console.log('Creating vehicles...');
  let vehicleCount = 0;
  const profiles = await prisma.carrierProfile.findMany({
    where: { userId: { in: carrierUserIds } },
  });

  const vehicleMapping = [
    { profileIdx: 0, vehicleIdx: 0 },
    { profileIdx: 0, vehicleIdx: 5 },
    { profileIdx: 1, vehicleIdx: 1 },
    { profileIdx: 2, vehicleIdx: 2 },
    { profileIdx: 2, vehicleIdx: 6 },
    { profileIdx: 3, vehicleIdx: 3 },
    { profileIdx: 4, vehicleIdx: 4 },
  ];

  for (const { profileIdx, vehicleIdx } of vehicleMapping) {
    const profile = profiles[profileIdx];
    if (!profile) continue;
    const vehicle = vehiclesData[vehicleIdx % vehiclesData.length];
    const exists = await prisma.vehicle.findUnique({
      where: {
        carrierId_plateNumber: {
          carrierId: profile.id,
          plateNumber: vehicle.plateNumber,
        },
      },
    });
    if (exists) continue;

    await prisma.vehicle.create({
      data: {
        carrierId: profile.id,
        type: profile.transportType,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        plateNumber: vehicle.plateNumber,
        capacityTons: vehicle.capacityTons,
        cargoVolume: vehicle.cargoVolume,
      },
    });
    vehicleCount++;
  }
  console.log(`  Created ${vehicleCount} vehicles`);

  // ── Orders ──────────────────────────────────────────────
  console.log('Creating demo orders...');
  const allClients = await prisma.user.findMany({
    where: { role: UserRole.CLIENT },
  });
  const existingOrderComments = new Set(
    (
      await prisma.order.findMany({
        where: { comment: { startsWith: 'DEMO_ORDER_' } },
        select: { comment: true },
      })
    )
      .map((o) => o.comment)
      .filter(Boolean),
  );

  const originPools = [
    { city: 'Aktau', country: 'Kazakhstan' },
    { city: 'Zhanaozen', country: 'Kazakhstan' },
    { city: 'Shetpe', country: 'Kazakhstan' },
    { city: 'Beineu', country: 'Kazakhstan' },
    { city: 'Kuryk', country: 'Kazakhstan' },
    { city: 'Zhetybai', country: 'Kazakhstan' },
  ];

  const destPools = [
    { city: 'Aktau', country: 'Kazakhstan' },
    { city: 'Zhanaozen', country: 'Kazakhstan' },
    { city: 'Shetpe', country: 'Kazakhstan' },
    { city: 'Beineu', country: 'Kazakhstan' },
    { city: 'Kuryk', country: 'Kazakhstan' },
    { city: 'Taushyk', country: 'Kazakhstan' },
    { city: 'Senek', country: 'Kazakhstan' },
    { city: 'Kyzylsay', country: 'Kazakhstan' },
    { city: 'Akzhigit', country: 'Kazakhstan' },
    { city: 'Borankul', country: 'Kazakhstan' },
  ];

  const cargoTypes = [
    'Food and Water',
    'Construction Materials',
    'Fuel and Lubricants',
    'Auto Parts',
    'Industrial Equipment',
    'Household Goods',
  ];
  const statuses = [
    OrderStatus.SEARCHING,
    OrderStatus.ASSIGNED,
    OrderStatus.IN_TRANSIT,
    OrderStatus.DELIVERED,
  ];

  function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  let orderCount = 0;
  for (let i = 0; i < 30; i++) {
    const comment = `DEMO_ORDER_${i}`;
    if (existingOrderComments.has(comment)) continue;

    const client = pick(allClients);
    const origin = pick(originPools);
    const dest = pick(destPools);
    const regionalDistance = resolveMangystauDistance(origin.city, dest.city);
    const cargoType = pick(cargoTypes);
    const status = pick(statuses);
    const createdAt = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 86400000,
    );

    const order = await prisma.order.create({
      data: {
        clientId: client.id,
        carrierId:
          status !== OrderStatus.SEARCHING && profiles.length > 0
            ? pick(profiles).id
            : undefined,
        title: `${cargoType} Shipment #${2000 + i}`,
        cargoType,
        weight: Number((Math.random() * 2000 + 50).toFixed(2)),
        volume: Number((Math.random() * 30 + 1).toFixed(2)),
        origin: `${origin.city}, ${origin.country}`,
        originCity: origin.city,
        originCountry: origin.country,
        destination: `${dest.city}, ${dest.country}`,
        destinationCity: dest.city,
        destinationCountry: dest.country,
        estimatedPrice: Math.floor(Math.random() * 5000) + 300,
        estimatedDeliveryTime:
          regionalDistance?.estimatedDurationMinutes ??
          Math.floor(Math.random() * 200) + 48,
        estimatedCarrierSearchTime: 60,
        status,
        comment,
        createdAt,
        updatedAt: new Date(),
      },
    });

    const events: { status: OrderStatus; location: string; timestamp: Date }[] =
      [
        {
          status: OrderStatus.ASSIGNED,
          location: origin.city,
          timestamp: createdAt,
        },
      ];

    if (status === OrderStatus.IN_TRANSIT || status === OrderStatus.DELIVERED) {
      events.push({
        status: OrderStatus.IN_TRANSIT,
        location: 'Transit Hub',
        timestamp: new Date(createdAt.getTime() + 86400000),
      });
    }

    if (status === OrderStatus.DELIVERED) {
      events.push({
        status: OrderStatus.DELIVERED,
        location: dest.city,
        timestamp: new Date(createdAt.getTime() + 3 * 86400000),
      });
    }

    await prisma.orderTracking.createMany({
      data: events.map((e) => ({
        orderId: order.id,
        status: e.status,
        location: e.location,
        timestamp: e.timestamp,
        createdAt: e.timestamp,
      })),
    });

    if (status !== OrderStatus.SEARCHING) {
      await prisma.route.create({
        data: {
          orderId: order.id,
          distanceKm:
            regionalDistance?.distanceKm ??
            Math.floor(Math.random() * 4000) + 500,
          durationMinutes:
            regionalDistance?.estimatedDurationMinutes ??
            Math.floor(Math.random() * 6000) + 600,
          geometry: { type: 'LineString', coordinates: [] },
        },
      });
    }

    orderCount++;
  }

  console.log(`  Created ${orderCount} orders with tracking events and routes`);
  console.log('\nDemo data seed complete!');
  console.log(`  Clients:   ${clientCount} new (${allClients.length} total)`);
  console.log(`  Carriers:  ${carrierCount} new`);
  console.log(`  Vehicles:  ${vehicleCount} new`);
  console.log(`  Orders:    ${orderCount} new`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
