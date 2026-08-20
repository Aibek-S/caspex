import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type DistanceRecord = {
  originId: string;
  destinationId: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
};

type SettlementRecord = {
  id: string;
  name: string;
};

const settlements = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'prisma/data/mangystau-settlements.json'),
    'utf8',
  ),
) as SettlementRecord[];
const distances = JSON.parse(
  readFileSync(
    resolve(process.cwd(), 'prisma/data/mangystau-distances.json'),
    'utf8',
  ),
) as DistanceRecord[];
const settlementIds = new Map(
  settlements.map((settlement) => [settlement.name, settlement.id]),
);

export function resolveMangystauDistance(
  originCity: string,
  destinationCity: string,
) {
  const originId = settlementIds.get(originCity);
  const destinationId = settlementIds.get(destinationCity);
  if (!originId || !destinationId) return null;

  return (
    distances.find(
      (distance) =>
        (distance.originId === originId &&
          distance.destinationId === destinationId) ||
        (distance.originId === destinationId &&
          distance.destinationId === originId),
    ) ?? null
  );
}
