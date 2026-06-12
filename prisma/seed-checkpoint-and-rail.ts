import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const checkpoints = [
  { name: 'Достык — Алашанькоу', latitude: 45.25, longitude: 82.483 },
  { name: 'Нур Жолы — Хоргос', latitude: 44.2, longitude: 80.0 },
  { name: 'Алимбет', latitude: 42.8, longitude: 72.0 },
  { name: 'Айша-Биби', latitude: 42.9, longitude: 71.5 },
  { name: 'Темир Баба', latitude: 47.8, longitude: 55.0 },
  { name: 'Курмангазы', latitude: 46.6, longitude: 49.0 },
  { name: 'Тажен', latitude: 47.5, longitude: 54.0 },
  { name: 'Жайсан', latitude: 44.5, longitude: 78.5 },
  { name: 'Бектас', latitude: 47.3, longitude: 53.5 },
  { name: 'Кайрат', latitude: 42.5, longitude: 70.5 },
  { name: 'Жетыбай', latitude: 48.0, longitude: 55.8 },
  { name: 'Ак-Тилек', latitude: 42.7, longitude: 71.2 },
  { name: 'Жанажол', latitude: 47.1, longitude: 52.8 },
];

const trainSchedules = [
  { stationName: 'Бейнеу', departuresPerDay: 14, latitude: 45.317, longitude: 55.2 },
  { stationName: 'Актау (порт)', departuresPerDay: 8, latitude: 43.65, longitude: 51.167 },
  { stationName: 'Атырау', departuresPerDay: 20, latitude: 47.117, longitude: 51.883 },
  { stationName: 'Шалкар', departuresPerDay: 6, latitude: 47.833, longitude: 59.617 },
  { stationName: 'Кандыагаш', departuresPerDay: 10, latitude: 49.467, longitude: 57.417 },
  { stationName: 'Сарыагаш', departuresPerDay: 12, latitude: 41.467, longitude: 69.167 },
  { stationName: 'Достык (ЖД)', departuresPerDay: 16, latitude: 45.25, longitude: 82.483 },
];

async function main() {
  console.log('Seeding Checkpoint records...');
  for (const cp of checkpoints) {
    await prisma.checkpoint.upsert({
      where: { name: cp.name },
      update: {
        latitude: cp.latitude,
        longitude: cp.longitude,
      },
      create: {
        name: cp.name,
        loadPercent: 0,
        avgWaitMinutes: 0,
        latitude: cp.latitude,
        longitude: cp.longitude,
      },
    });
  }
  console.log(`  Created/updated ${checkpoints.length} checkpoints`);

  console.log('Seeding TrainSchedule records...');
  for (const ts of trainSchedules) {
    await prisma.trainSchedule.upsert({
      where: { stationName: ts.stationName },
      update: {
        latitude: ts.latitude,
        longitude: ts.longitude,
      },
      create: {
        stationName: ts.stationName,
        departuresPerDay: ts.departuresPerDay,
        currentLoad: 0,
        avgDelayMinutes: 0,
        latitude: ts.latitude,
        longitude: ts.longitude,
      },
    });
  }
  console.log(`  Created/updated ${trainSchedules.length} train schedules`);

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
