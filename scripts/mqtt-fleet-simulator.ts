import * as mqtt from 'mqtt';
import * as fs from 'fs';
import * as path from 'path';

interface FleetDeviceConfig {
  name: string;
  type: string;
  vehicleId?: string;
  route: Array<[number, number]>;
  baseSpeedKmh: number;
  temperatureBase?: number;
}

interface FleetDevice extends FleetDeviceConfig {
  deviceKey: string;
  apiKey: string;
}

const API_BASE = process.env.API_BASE ?? 'http://localhost:3000';
const MQTT_URL = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'superadmin@caspex.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'gang1234';
const STATE_FILE = path.join(import.meta.dirname, 'fleet-devices.json');

const DEMO_ROUTES: FleetDeviceConfig[] = [
  {
    name: 'Volvo FH16 · Актау → Жанаозен',
    type: 'GPS_TRACKER',
    route: [
      [51.167, 43.6507],
      [51.51, 43.42],
      [52.8619, 43.3407],
    ],
    baseSpeedKmh: 72,
    temperatureBase: 27,
  },
  {
    name: 'Kamaz 54901 · Актау → Форт-Шевченко',
    type: 'GPS_TRACKER',
    route: [
      [51.167, 43.6507],
      [50.92, 44.02],
      [50.2637, 44.5119],
    ],
    baseSpeedKmh: 58,
    temperatureBase: 24,
  },
  {
    name: 'MAN TGX · Жанаозен → Бейнеу',
    type: 'GPS_TRACKER',
    route: [
      [52.8619, 43.3407],
      [53.05, 43.9],
      [52.6014, 45.3245],
    ],
    baseSpeedKmh: 64,
    temperatureBase: 30,
  },
];

const api = {
  async post<T>(url: string, body: unknown, token?: string): Promise<T> {
    const res = await fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as T | { message?: string };
    if (!res.ok) {
      throw new Error(
        `POST ${url} -> ${res.status}: ${JSON.stringify(json).slice(0, 300)}`,
      );
    }
    return json as T;
  },
};

async function adminToken(): Promise<string> {
  const body = await api.post<{ accessToken: string }>('/auth/login', {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  return body.accessToken;
}

async function loadOrCreateDevices(
  token: string,
  configs: FleetDeviceConfig[],
): Promise<FleetDevice[]> {
  let state: FleetDevice[] = [];
  if (fs.existsSync(STATE_FILE)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) as FleetDevice[];
    } catch {
      state = [];
    }
  }

  const byKey = new Map(state.map((d) => [d.deviceKey, d]));
  const result: FleetDevice[] = [];

  for (const cfg of configs) {
    const existing = byKey.get(
      state.find(
        (s) => s.name === cfg.name && s.route[0][0] === cfg.route[0][0],
      )?.deviceKey ?? '',
    );
    if (existing && existing.apiKey) {
      result.push({ ...cfg, ...existing });
      continue;
    }
    const created = await api.post<{ device: { deviceKey: string; apiKey: string } }>(
      '/devices',
      {
        name: cfg.name,
        type: cfg.type,
        ...(cfg.vehicleId ? { vehicleId: cfg.vehicleId } : {}),
      },
      token,
    );
    const device: FleetDevice = {
      ...cfg,
      deviceKey: created.device.deviceKey,
      apiKey: created.device.apiKey,
    };
    result.push(device);
    console.log(
      `[device] created ${cfg.name}  key=${device.deviceKey}  apiKey=${device.apiKey}`,
    );
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(result, null, 2));
  return result;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371;
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLng = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

interface Track {
  segments: Array<{ end: number; from: [number, number]; to: [number, number] }>;
  totalKm: number;
}

function buildTrack(route: Array<[number, number]>): Track {
  const segments: Track['segments'] = [];
  let acc = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to = route[i + 1];
    acc += haversineKm(from, to);
    segments.push({ end: acc, from, to });
  }
  return { segments, totalKm: acc };
}

function pointAt(track: Track, km: number): [number, number] {
  const d = ((km % track.totalKm) + track.totalKm) % track.totalKm;
  let acc = 0;
  for (const s of track.segments) {
    if (d <= s.end) {
      const segLen = haversineKm(s.from, s.to);
      const t = segLen === 0 ? 0 : (d - acc) / segLen;
      return [
        s.from[0] + (s.to[0] - s.from[0]) * t,
        s.from[1] + (s.to[1] - s.from[1]) * t,
      ];
    }
    acc = s.end;
  }
  const last = track.segments[track.segments.length - 1];
  return last.to;
}

class VehicleSim {
  readonly track: Track;
  readonly device: FleetDevice;
  readonly index: number;
  progressKm = 0;
  doorOpen = false;
  tempSpikeUntil = 0;

  constructor(device: FleetDevice, index: number) {
    this.device = device;
    this.index = index;
    this.track = buildTrack(device.route);
  }

  tick(dtSec: number, now: number): void {
    const jitter = Math.sin(now / 9000 + this.index * 1.7) * 6;
    const speed = Math.max(18, this.device.baseSpeedKmh + jitter);
    this.progressKm += (speed * dtSec) / 3600;
    if (this.progressKm > this.track.totalKm) this.progressKm = 0;
    if (Math.random() < 0.004) this.doorOpen = !this.doorOpen;
    if (Math.random() < 0.003) this.tempSpikeUntil = now + 20000;
  }

  payload(now: number): Record<string, unknown> {
    const [lng, lat] = pointAt(this.track, this.progressKm);
    const jitter = Math.sin(now / 6000 + this.index * 2.3) * 6;
    const speed = Math.max(
      18,
      this.device.baseSpeedKmh + Math.sin(now / 9000 + this.index * 1.7) * 6,
    );
    const tempBase = this.device.temperatureBase ?? 25;
    const temperature = now < this.tempSpikeUntil ? tempBase + 6 : tempBase + jitter / 3;
    return {
      apiKey: this.device.apiKey,
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
      speedKmh: Number(speed.toFixed(1)),
      temperature: Number(temperature.toFixed(1)),
      humidity: Number((38 + Math.sin(now / 5000 + this.index) * 12).toFixed(1)),
      tilt: Number((Math.abs(Math.sin(now / 4500 + this.index)) * 8).toFixed(1)),
      doorOpen: this.doorOpen,
      batteryPct: Math.floor(78 + (this.index % 3) * 5 + Math.sin(now / 20000) * 3),
      photoUrl: null,
      ts: now,
    };
  }
}

const args = process.argv.slice(2);
let configs: FleetDeviceConfig[] = [];
if (args.includes('--demo') || !args.length) {
  configs = DEMO_ROUTES;
} else {
  const idx = args.indexOf('--devices');
  if (idx === -1) {
    console.error('usage: mqtt-fleet-simulator.ts [--demo | --devices fleet.json]');
    process.exit(1);
  }
  configs = JSON.parse(
    fs.readFileSync(path.resolve(args[idx + 1]), 'utf8'),
  ) as FleetDeviceConfig[];
}

async function main(): Promise<void> {
  const token = await adminToken();
  console.log(`[auth] admin token ok (${ADMIN_EMAIL})`);
  const devices = await loadOrCreateDevices(token, configs);
  console.log(`[fleet] ${devices.length} devices ready -> ${MQTT_URL}`);

  const client = mqtt.connect(MQTT_URL, { reconnectPeriod: 2000 });
  const sims = devices.map((d, i) => new VehicleSim(d, i));

  const interval = Number(process.env.FLEET_INTERVAL_MS ?? 3000);
  let last = Date.now();

  client.on('connect', () => {
    console.log('[mqtt] connected');
    request();
  });

  client.on('error', (err) => {
    console.error('[mqtt] error:', err.message);
  });

  function request(): void {
    const now = Date.now();
    const dt = (now - last) / 1000;
    last = now;
    for (const sim of sims) {
      sim.tick(dt, now);
      const msg = JSON.stringify(sim.payload(now));
      client.publish(`casp/telemetry/${sim.device.deviceKey}`, msg, {
        qos: 1,
      });
    }
    setTimeout(request, interval);
  }

  const stop = (): void => {
    console.log('\n[sim] stopping...');
    client.end(true, () => process.exit(0));
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

void main().catch((err: Error) => {
  console.error('[fatal]', err.message);
  process.exit(1);
});