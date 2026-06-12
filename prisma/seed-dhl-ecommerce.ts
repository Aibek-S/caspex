import 'dotenv/config';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const origins = [
  { city: 'Shanghai', country: 'China' },
  { city: 'Shenzhen', country: 'China' },
  { city: 'Ningbo', country: 'China' },
  { city: 'Hong Kong', country: 'China' },
  { city: 'Dubai', country: 'UAE' },
  { city: 'Hamburg', country: 'Germany' },
];

const destinations = [
  { city: 'Aktau', country: 'Kazakhstan' },
  { city: 'Almaty', country: 'Kazakhstan' },
  { city: 'Astana', country: 'Kazakhstan' },
  { city: 'Shymkent', country: 'Kazakhstan' },
  { city: 'Karaganda', country: 'Kazakhstan' },
  { city: 'Atyrau', country: 'Kazakhstan' },
  { city: 'Baku', country: 'Azerbaijan' },
  { city: 'Tashkent', country: 'Uzbekistan' },
];

const cargoTypes = [
  'Electronics',
  'Industrial Equipment',
  'Food Products',
  'Textiles',
  'Auto Parts',
  'Chemicals',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const clients = await prisma.user.findMany({ where: { role: 'CLIENT' } });
  if (clients.length === 0) throw new Error('No clients found. Run seed:demo first.');

  const profiles = await prisma.carrierProfile.findMany();
  if (profiles.length === 0) throw new Error('No carriers found. Run seed:demo first.');

  const existingComments = new Set(
    (await prisma.order.findMany({
      where: { comment: { startsWith: 'DHL_SEED_' } },
      select: { comment: true },
    })).map((o) => o.comment).filter(Boolean),
  );

  let created = 0;

  for (let i = 0; i < 25; i++) {
    const comment = `DHL_SEED_${i}`;
    if (existingComments.has(comment)) continue;

    const origin = randomItem(origins);
    const destination = randomItem(destinations);
    const status = randomItem([OrderStatus.SEARCHING, OrderStatus.ASSIGNED, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED]);
    const client = randomItem(clients);
    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000);

    const order = await prisma.order.create({
      data: {
        clientId: client.id,
        carrierId: status !== OrderStatus.SEARCHING ? randomItem(profiles).id : undefined,
        title: `${randomItem(cargoTypes)} DHL Shipment #${3000 + i}`,
        cargoType: randomItem(cargoTypes),
        weight: Number((Math.random() * 2000 + 50).toFixed(2)),
        volume: Number((Math.random() * 30 + 1).toFixed(2)),
        origin: `${origin.city}, ${origin.country}`,
        originCity: origin.city,
        originCountry: origin.country,
        destination: `${destination.city}, ${destination.country}`,
        destinationCity: destination.city,
        destinationCountry: destination.country,
        estimatedPrice: Math.floor(Math.random() * 5000) + 300,
        estimatedDeliveryTime: Math.floor(Math.random() * 200) + 48,
        estimatedCarrierSearchTime: 60,
        status,
        comment,
        createdAt,
        updatedAt: new Date(),
      },
    });

    const events: { status: OrderStatus; location: string; timestamp: Date }[] = [
      { status: OrderStatus.ASSIGNED, location: origin.city, timestamp: createdAt },
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
        location: destination.city,
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
          distanceKm: Math.floor(Math.random() * 4000) + 500,
          durationMinutes: Math.floor(Math.random() * 6000) + 600,
          geometry: { type: 'LineString', coordinates: [] },
        },
      });
    }

    created++;
  }

  console.log(`Created ${created} DHL orders with carriers, tracking, and routes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
