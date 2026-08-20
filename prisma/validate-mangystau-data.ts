import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

type Settlement = {
  id: string;
  name: string;
  nameRu: string;
  nameKk: string;
  type: string;
  district: string;
  latitude: number;
  longitude: number;
};

type Distance = {
  id: string;
  originId: string;
  destinationId: string;
  distanceKm: number;
  estimatedDurationMinutes: number;
};

type CargoScenario = {
  id: string;
  originId: string;
  destinationId: string;
  routeDistanceId: string;
};

type AnalyticsFixtures = {
  districts: Array<{ district: string; demoOrderSharePercent: number }>;
  cargoCategories: Array<{ category: string; orderSharePercent: number }>;
  routeKpis: Array<{ routeId: string }>;
};

const readJson = <T>(fileName: string): T =>
  JSON.parse(readFileSync(resolve(process.cwd(), fileName), 'utf8')) as T;

const settlements = readJson<Settlement[]>(
  'prisma/data/mangystau-settlements.json',
);
const distances = readJson<Distance[]>('prisma/data/mangystau-distances.json');
const cargoScenarios = readJson<CargoScenario[]>(
  'prisma/data/mangystau-cargo-scenarios.json',
);
const analytics = readJson<AnalyticsFixtures>(
  'prisma/data/mangystau-analytics-fixtures.json',
);
const allowedTypes = new Set(['city', 'town', 'village', 'settlement']);
const allowedDistricts = new Set([
  'Aktau',
  'Zhanaozen',
  'Beineu',
  'Karakiya',
  'Mangystau',
  'Munaily',
  'Tupkaragan',
]);
const requiredFields: Array<keyof Settlement> = [
  'id',
  'name',
  'nameRu',
  'nameKk',
  'type',
  'district',
  'latitude',
  'longitude',
];

const duplicateCount = (values: string[]) =>
  [...new Set(values.filter((value, index) => values.indexOf(value) !== index))]
    .length;

const settlementIds = new Set(settlements.map((settlement) => settlement.id));
const distanceIds = new Set(distances.map((distance) => distance.id));
const invalidSettlements = settlements.filter(
  (settlement) =>
    requiredFields.some((field) => settlement[field] === undefined) ||
    !allowedTypes.has(settlement.type) ||
    !allowedDistricts.has(settlement.district) ||
    !Number.isFinite(settlement.latitude) ||
    !Number.isFinite(settlement.longitude) ||
    settlement.latitude < 40 ||
    settlement.latitude > 50 ||
    settlement.longitude < 45 ||
    settlement.longitude > 60,
);
const invalidDistances = distances.filter(
  (distance) =>
    !settlementIds.has(distance.originId) ||
    !settlementIds.has(distance.destinationId) ||
    distance.distanceKm <= 0 ||
    distance.estimatedDurationMinutes <= 0,
);
const invalidCargoScenarios = cargoScenarios.filter(
  (scenario) =>
    !settlementIds.has(scenario.originId) ||
    !settlementIds.has(scenario.destinationId) ||
    !distanceIds.has(scenario.routeDistanceId),
);
const invalidAnalyticsRoutes = analytics.routeKpis.filter(
  (route) => !distanceIds.has(route.routeId),
);
const districtShare = analytics.districts.reduce(
  (sum, district) => sum + district.demoOrderSharePercent,
  0,
);
const cargoShare = analytics.cargoCategories.reduce(
  (sum, category) => sum + category.orderSharePercent,
  0,
);
const duplicateCoordinates = duplicateCount(
  settlements.map(
    (settlement) => `${settlement.latitude},${settlement.longitude}`,
  ),
);

if (
  invalidSettlements.length > 0 ||
  invalidDistances.length > 0 ||
  invalidCargoScenarios.length > 0 ||
  invalidAnalyticsRoutes.length > 0 ||
  districtShare !== 100 ||
  cargoShare !== 100 ||
  duplicateCount(settlements.map((settlement) => settlement.id)) > 0 ||
  duplicateCount(settlements.map((settlement) => settlement.name)) > 0 ||
  duplicateCoordinates > 0
) {
  console.error({
    invalidSettlements,
    invalidDistances,
    invalidCargoScenarios,
    invalidAnalyticsRoutes,
    districtShare,
    cargoShare,
    duplicateCoordinates,
  });
  process.exit(1);
}

console.log(
  `Mangystau data valid: ${settlements.length} settlements, ${distances.length} routes, ${cargoScenarios.length} cargo scenarios.`,
);
