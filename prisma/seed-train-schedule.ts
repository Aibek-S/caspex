import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const API_BASE = 'https://tablo-railways.kz/api';

const headers = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0',
  Accept: 'application/json',
};

function isMinorStation(name: string): boolean {
  const n = name.trim();
  if (/^(оп|рзд|пп|разъезд|пост|блок|парк)\b/i.test(n)) return true;
  if (/\((рзд|оп|пп|разъезд|пост)\)$/i.test(n)) return true;
  if (/\d+\s*км/.test(n)) return true;
  return false;
}

function getCoords(s: any): { lat: number; lng: number } | null {
  if (s.latitude && s.longitude && s.latitude !== '') {
    return { lat: Number(s.latitude), lng: Number(s.longitude) };
  }
  if (s.lonLat) {
    const parts = s.lonLat.split(',');
    if (parts.length === 2) {
      const lat = Number(parts[0].trim());
      const lng = Number(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
  }
  return null;
}

async function fetchTripsForStation(
  stId: string,
): Promise<{ departuresPerDay: number; currentLoad: number; avgDelayMinutes: number }> {
  try {
    const res = await fetch(`${API_BASE}/trips-new?stId=${stId}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { departuresPerDay: 0, currentLoad: 0, avgDelayMinutes: 0 };

    const trips: any[] = await res.json();
    let totalDelay = 0;
    let delayCount = 0;

    for (const trip of trips) {
      for (const station of trip.stations ?? []) {
        const delay = station.delay ?? 0;
        if (delay !== 0) {
          totalDelay += delay;
          delayCount++;
        }
      }
    }

    return {
      departuresPerDay: trips.length,
      currentLoad: trips.length,
      avgDelayMinutes: delayCount > 0 ? Math.round(totalDelay / delayCount) : 0,
    };
  } catch {
    return { departuresPerDay: 0, currentLoad: 0, avgDelayMinutes: 0 };
  }
}

async function main() {
  console.log('Fetching station list...');
  const seen = new Set<string>();
  const stations: any[] = [];

  const res = await fetch(
    `${API_BASE}/stations?page=0&countryCode=KZ`,
    { headers },
  );
  const data: any = await res.json();

  for (const s of data.content ?? []) {
    const name = s.title?.trim();
    if (!name || !s.ESRCode || seen.has(name)) continue;
    if (isMinorStation(name)) continue;
    const coords = getCoords(s);
    if (!coords) continue;
    seen.add(name);
    stations.push({ ...s, coords });
  }

  console.log(`  Total unique major stations: ${stations.length}`);

  stations.sort((a, b) => a.title.localeCompare(b.title));
  console.log(`\n  Total unique major stations: ${stations.length}\n`);

  const concurrency = 5;
  let updated = 0;

  for (let i = 0; i < stations.length; i += concurrency) {
    const batch = stations.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map((s) => fetchTripsForStation(s.id)),
    );

    for (let j = 0; j < batch.length; j++) {
      const s = batch[j];
      const trips = results[j];

      await prisma.trainSchedule.upsert({
        where: { stationName: s.title },
        update: {
          departuresPerDay: trips.departuresPerDay,
          currentLoad: trips.currentLoad,
          avgDelayMinutes: trips.avgDelayMinutes,
          latitude: s.coords.lat,
          longitude: s.coords.lng,
        },
        create: {
          stationName: s.title,
          departuresPerDay: trips.departuresPerDay,
          currentLoad: trips.currentLoad,
          avgDelayMinutes: trips.avgDelayMinutes,
          latitude: s.coords.lat,
          longitude: s.coords.lng,
        },
      });

      updated++;
    }

    process.stdout.write(
      `\r  Processing... ${updated}/${stations.length}`,
    );
  }

  console.log(`\n\nDone. Updated ${updated} train stations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
