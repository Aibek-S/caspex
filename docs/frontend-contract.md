# CaspX Frontend Contract (API + WebSocket)

Версия 1.0 · для фронтендера / AI-код-редактора. Живой OpenAPI: `GET /docs-json`, Swagger UI: `/docs`.

## 0. Базовые вещи

### Стек и адреса
- Backend (NestJS): `http://localhost:3000` (в dev), прод — по ссылке из README.
- WebSocket (socket.io): тот же origin, путь по умолчанию `/socket.io`.
- CORS включён для любых origins (`origin: true`) на REST и WS.

### Авторизация (JWT Bearer)
1. `POST /auth/register` или `POST /auth/login` → получаем `{ accessToken, refreshToken, user }`.
2. Все защищённые эндпоинты: заголовок `Authorization: Bearer <accessToken>`.
3. Когда accessToken протух (код 401) → `POST /auth/refresh` с `{ refreshToken }` → новые токены.
4. `POST /auth/logout` — отозвать refreshToken.
5. Роли (`user.role`): `CLIENT`, `CARRIER`, `ADMIN`, `SUPERADMIN`.

### Enums (общие)
```ts
type UserRole = 'CLIENT' | 'CARRIER' | 'ADMIN' | 'SUPERADMIN';
type OrderStatus = 'NEW' | 'SEARCHING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
type DeviceType = 'GPS_TRACKER' | 'SENSOR' | 'CAMERA';
type AlertType = 'TEMPERATURE_HIGH' | 'TEMPERATURE_LOW' | 'HUMIDITY_HIGH' | 'HUMIDITY_LOW' | 'TILT' | 'DOOR_OPEN' | 'SPEED' | 'OFFLINE';
type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
```

### Формат ошибки
```json
{ "statusCode": 400, "message": "описание или массив ошибок", "error": "Bad Request" }
```
Валидация: неизвестные поля в теле/query → 400 (`whitelist + forbidNonWhitelisted`).

### Типы (TS) для фронта
```ts
type User = {
  id: string; email: string; role: UserRole;
  firstName: string; lastName: string; phone: string;
  avatarUrl: string | null; companyName: string | null; companyLogo: string | null;
  city: string | null; country: string | null;
  isActive: boolean; lastLoginAt: string | null; createdAt: string; updatedAt: string;
};

type Vehicle = {
  id: string; carrierId: string; type: string; brand: string; model: string;
  year: number; plateNumber: string; capacityTons: number; cargoVolume: number;
  vehicleImageUrl: string | null; createdAt: string; updatedAt: string;
  // поля живого трекинга (появятся в ответах, где используются):
  lastLatitude?: number | null; lastLongitude?: number | null;
  lastSpeedKmh?: number | null; lastTelemetryAt?: string | null;
};

type Order = {
  id: string; clientId: string; carrierId: string | null;
  title: string; cargoType: string; weight: number; volume: number;
  origin: string; originCity: string | null; originCountry: string | null;
  destination: string; destinationCity: string | null; destinationCountry: string | null;
  originLat: number | null; originLng: number | null;
  destinationLat: number | null; destinationLng: number | null;
  cargoPhotoUrl: string | null; productPhotoUrls: string[];
  comment: string | null; estimatedPrice: number | null;
  estimatedDeliveryTime: number | null; estimatedCarrierSearchTime: number | null;
  status: OrderStatus; createdAt: string; updatedAt: string;
};

type TelemetryReading = {
  id: string; deviceId: string; vehicleId: string | null; orderId: string | null;
  lat: number; lng: number; speedKmh: number | null;
  temperature: number | null; humidity: number | null; tilt: number | null;
  doorOpen: boolean | null; batteryPct: number | null; photoUrl: string | null;
  source: string; ts: string; createdAt: string;
};

type Alert = {
  id: string; deviceId: string; vehicleId: string | null; orderId: string | null;
  type: AlertType; severity: AlertSeverity; message: string;
  metadata: Record<string, unknown> | null; active: boolean;
  resolvedAt: string | null; createdAt: string;
};

type Device = {
  id: string; name: string; deviceKey: string; type: DeviceType;
  vehicleId: string | null; isActive: boolean; firmware: string | null;
  lastSeenAt: string | null; lastLatitude: number | null; lastLongitude: number | null;
  createdAt: string; updatedAt: string;
};
// Только при создании устройства дополнительно возвращается apiKey (одноразово):
type DeviceCreated = Device & { apiKey: string };
```

### Демо-аккаунты (уже засеяны в dev-БД)
| Роль | Email | Пароль |
|---|---|---|
| Суперадмин | `superadmin@caspex.local` | `gang1234` |
| Клиент | `astana-logistics@mail.kz` | `Client_123` |
| Перевозчик | `dostyk-carrier@mail.kz` | `Carrier_123` |
| Перевозчик | `steppe-freight@mail.kz` | `Carrier_123` |

---

## 1. Auth

### POST /auth/register — публичный
Body:
```json
{ "email": "client01@caspex.local", "password": "CaspXPass_123", "role": "CLIENT",
  "firstName": "Alibi", "lastName": "Samatov", "phone": "+77017777777",
  "companyName": "Опц.", "city": "Aktau", "country": "Kazakhstan" }
```
`role` принимает только `CLIENT` и `CARRIER`. Ответ: `{ user }` (без токенов — после регистрации нужно логиниться).
Rate limit: 5/мин.

### POST /auth/login — публичный
Body: `{ "email": "...", "password": "..." }` → `{ accessToken, refreshToken, user }`.

### POST /auth/refresh — публичный
Body: `{ "refreshToken": "..." }` → `{ accessToken, refreshToken, user }`.

### POST /auth/logout — публичный
Body: `{ "refreshToken": "..." }` → `{ success: true }`.

### GET /auth/me — Bearer
→ `{ user }`. Rate limit: 120/мин.

---

## 2. Клиент: заявки (Orders)

### POST /orders — Bearer (CLIENT или SUPERADMIN; ADMIN нельзя)
Body:
```json
{
  "title": "Продукты в Жанаозен",
  "cargoType": "FOOD",
  "weight": 2000, "volume": 8,
  "origin": "Актау", "originCity": "Актау", "originCountry": "Казахстан",
  "originLat": 43.6507, "originLng": 51.167,
  "destination": "Жанаозен", "destinationCity": "Жанаозен", "destinationCountry": "Казахстан",
  "destinationLat": 43.3407, "destinationLng": 52.8619,
  "comment": "Опц.", "estimatedPrice": 150000,
  "estimatedDeliveryTime": 8, "estimatedCarrierSearchTime": 120,
  "cargoPhotoUrl": "https://...", "productPhotoUrls": ["https://..."]
}
```
`originLat/originLng/destinationLat/destinationLng` — обязательные числа, **если** не переданы `originSettlementId`/`destinationSettlementId`. Ответ: `{ order, route, routeCalculated }` со `status: "SEARCHING"`.

**Региональный режим (рекомендуемый для демо):** передай `originSettlementId` + `destinationSettlementId` из `GET /settlements` вместо координат — сервер сам подставит названия и координаты и посчитает маршрут через OpenRouteService:
```json
{
  "title": "Продукты в Жанаозен",
  "cargoType": "FOOD", "weight": 2000, "volume": 8,
  "originSettlementId": "aktau",
  "destinationSettlementId": "zhanaozen"
}
```
Ответ:
```json
{
  "order": { "origin": "Aktau", "originCity": "Aktau", "originSettlementId": "aktau",
             "destination": "Zhanaozen", "destinationSettlementId": "zhanaozen",
             "originLat": 43.65, "originLng": 51.16, "destinationLat": 43.34, "destinationLng": 52.86,
             "estimatedDeliveryTime": 2, "routeCalculated": true },
  "route": { "id": "...", "distanceKm": 149.08, "durationMinutes": 101.7,
             "geometry": { "type": "LineString", "coordinates": [[lng, lat], ...] }, "createdAt": "..." },
  "routeCalculated": true
}
```

### GET /settlements — публичный (или Bearer) — список поселений Мангистау
→ `{ settlements: Settlement[] }`. Нужен для форм «откуда/куда» и авто-маршрута.
`Settlement = { id, name, nameRu, nameKk, type: "city"|"town"|"village"|"railway_station", district, latitude, longitude }`
`id` — стабильный slug (`aktau`, `zhanaozen`, `fort-shevchenko`, `shetpe`, `beineu`...). Доступны: 33 поселения, районы: Aktau, Munaily, Tupkaragan, Karakiya, Mangystau, Beineu, Zhanaozen.

### GET /orders — Bearer — мои заказы (клиент — созданные, перевозчик — взятые)
→ `{ orders: Order[] }`

### GET /orders/available — Bearer — биржа для перевозчика
Query (все опциональны): `origin`, `destination`, `weightMin`, `weightMax`, `sortBy` (`createdAt`|`weight`), `order` (`asc`|`desc`), `limit` (1..500, дефолт 100).
→ `{ orders: Order[] }` (только без перевозчика и со статусом NEW/SEARCHING).

### GET /orders/:id — Bearer — детали заказа
Видит только: суперадмин, владелец-клиент, назначенный перевозчик. → `{ order }`.

### PATCH /orders/:id — Bearer — изменить заказ (только владелец/суперадмин, только пока NEW/SEARCHING)
Body — частичный из полей создания. → `{ order }`.

### PATCH /orders/:id/status — Bearer
Body: `{ "status": "IN_TRANSIT" }`. Права: клиент может только `CANCELLED`; назначенный перевозчик — `IN_TRANSIT`/`DELIVERED`; суперадмин — любой. → `{ order }`.

### POST /orders/:id/accept — Bearer (CARRIER/SUPERADMIN) — «взять заказ»
Назначает текущего перевозчика, статус → `ASSIGNED`. → `{ order }`.

### GET /orders/:id/track — Bearer — всё для карты заказа
→ `{ order, route: Route | null, latestReading: TelemetryReading | null, alerts: Alert[] }`
`Route = { id, orderId, distanceKm, durationMinutes, geometry, createdAt }`, `geometry = { type: "LineString", coordinates: number[][] }` (координаты в формате `[lng, lat]` — для Leaflet менять местами!).

### DELETE /orders/:id — Bearer — удалить свою заявку (нельзя, если IN_TRANSIT/DELIVERED)

### POST /orders/:id/assign — алиас `/accept` (то же самое)

---

## 3. Перевозчик: профиль, машины

### POST /carrier/apply — Bearer (CLIENT хочет стать перевозчиком)
Body: `{ "experienceYears": 5, "transportType": "ROAD", "description": "..." }` → `{ carrierProfile }`.

### GET /carrier/profile — Bearer — мой профиль перевозчика
→ `{ carrierProfile }` (id, userId, experienceYears, transportType, description, isApproved, createdAt, updatedAt).

### PATCH /carrier/profile — Bearer — обновить профиль

### POST /vehicles — Bearer (CARRIER) — добавить машину
Body:
```json
{ "type": "TRUCK", "brand": "Volvo", "model": "FH16", "year": 2021,
  "plateNumber": "123ABC12", "capacityTons": 20, "cargoVolume": 86,
  "vehicleImageUrl": "https://..." }
```
→ `{ vehicle }`.

### GET /vehicles — Bearer — мои машины → `{ vehicles: Vehicle[] }`
### PATCH /vehicles/:id, DELETE /vehicles/:id — Bearer — свои машины

---

## 4. Живой трекинг: телеметрия и устройства

> Телеметрию шлют устройства по MQTT (не фронт). Фронт показывает позиции через **WebSocket** и REST.

### GET /telemetry/vehicle/:vehicleId?limit=100 — Bearer
История показаний (свежие сверху). → `{ readings: TelemetryReading[] }`.

### GET /telemetry/vehicle/:vehicleId/latest — Bearer
→ `{ reading: TelemetryReading | null }`.

### GET /alerts?active=true&vehicleId=..&orderId=..&limit=.. — Bearer
→ `{ alerts: Alert[] }`.

### PATCH /alerts/:id/resolve — Bearer — закрыть алерт → `{ alert }`.

### Devices (SUPERADMIN-only) — для демо можно показывать «устройства» как таблицу
- `POST /devices` Body `{ name, type: "GPS_TRACKER", vehicleId?, firmware? }` → `{ device }` (включает **apiKey — показать один раз**).
- `GET /devices`, `GET /devices/:id`, `PATCH /devices/:id` (тело: `name/type/vehicleId/isActive/firmware`), `DELETE /devices/:id`.

---

## 5. Аналитика для акимата

### GET /analytics/flows?days=30 — Bearer
→ `{ flows: [{ origin, destination, count, totalWeight, totalVolume }], totalOrders, totalWeight, totalVolume, periodDays, generatedAt }` (сортировка по count desc).

### GET /analytics/regional-summary — Bearer
→ `{ totalOrders, deliveredOrders, activeTrips, activeVehicles, totalTelemetryReadings, totalKm, generatedAt }`.

### GET /analytics/economic — Bearer
→ `{ totalKm, emptyKmBaseline, emptyKmOptimized, savedEmptyKm, totalFuelLiters, savedFuelLiters, fuelPriceTengePerLiter, savedMoneyTenge, savedHours, assumptions, generatedAt }`.

### GET /route-conditions/:orderId — Bearer
→ `{ orderId, origin, destination, distanceKm, durationMinutes, etaMinutes, conditions, weather, nearbyCheckpoints, warnings, weatherAvailable, generatedAt }`.
`conditions = { maxTemperature, minTemperature, maxWindMs, rain, snow, dust, warnings, estimatedDelayMinutes }`.
`warnings[i] = { type: "HEAT"|"DUST"|"RAIN"|"WIND", severity: "info"|"warning"|"critical", message }`.
`weatherAvailable === false`, когда нет ключа OpenWeather (пока так и будет).

---

## 6. Маршруты / Прогнозы / КПП / Загрузки

### POST /routes/calculate — Bearer
Body: `{ orderId? }` (возьмёт координаты заказа) или `{ startLat, startLng, endLat, endLng }`.
→ `{ routeId, orderId, distanceKm, durationMinutes, geometry: { type, coordinates: [lng, lat][] } }`.

### POST /predictions/land — публичный — Body `{ orderId }` (нужны ключи OpenAI/OpenWeather — может падать, пока ключи заглушки).
### POST /predictions/marine — публичный — `{ originLat, originLng, destLat, destLng }`.

### GET /checkpoint-loads/current — публичный — последний снапшот загрузки КПП.
### POST /checkpoint-loads/sync — SUPERADMIN — запустить скрапер Qoldau.

---

## 7. Загрузка файлов (multipart/form-data)

### POST /uploads/avatar — Bearer — поле `file` (jpg/png/webp, ≤8MB) → `{ user }`.
### POST /uploads/cargo — Bearer — поля `orderId` + `file` → `{ order }`.
### POST /uploads/product — Bearer — поля `orderId` + `file` → `{ order }`.
Файлы раздаются с `/uploads/...`; в БД сохраняется полный публичный URL.

---

## 8. Суперадмин (панель управления)

Все под `Bearer` + роль `SUPERADMIN`:
- `GET /superadmin/vehicles?page&limit&search...` → `{ vehicles, total, page, limit }`.
- `GET /superadmin/users`, `POST /superadmin/users` (создать любого), `GET /superadmin/users/:id`, `PATCH /superadmin/users/:id/role` `{ role }`, `PATCH /superadmin/users/:id/status` `{ isActive }`, `PATCH /superadmin/users/:id/password` `{ password }`.
- `GET /superadmin/orders`, `GET/PATCH/DELETE /superadmin/orders/:id`.
- `GET /superadmin/carriers`, `PATCH /superadmin/carriers/:id/approval` `{ isApproved }`.

---

## 9. WebSocket (socket.io) — LIVE

### Подключение
```ts
import { io } from 'socket.io-client';
const socket = io(BASE_URL, { auth: { token: accessToken } });
```
Токен можно передать также в query `?token=` или заголовке `Authorization: Bearer ...`. Неверный/протухший токен → disconnect.

### Роли доступа
Любой аутентифицированный попадает в комнату `fleet` (видит позиции всех машин и алерты).

### Подписки (клиент отправляет после connect)
```ts
socket.emit('subscribe:vehicle', { id: vehicleId });
socket.emit('subscribe:order',   { id: orderId });
```
Нужно для точечных подписок; общий поток (`fleet`) уже активен.

### События (сервер → клиент)
| Событие | Payload |
|---|---|
| `position:{vehicleId}` | `{ lat, lng, speedKmh, temperature, humidity, tilt, doorOpen, orderId, vehicleId, ts }` — приходит на каждое показание (3–5 сек). Приходит в `fleet` и в комнату `vehicle:{id}` |
| `order:{orderId}` | `{ status, lat, lng, ts }` — обновление по заказу |
| `alert` | `{ id, type, severity, message, vehicleId, orderId, createdAt }` — новый алерт |

### Отрисовка карты (Leaflet-подсказка)
- Координаты в WS и REST идут как `lat/lng`.
- GeoJSON из `/routes/calculate` и `route.geometry` — `[lng, lat]` → в Leaflet использовать `L.latLng([lat, lng])` (поменять местами).

---

## 10. Предлагаемая структура фронта и маппинг

| Экран | Роль | Данные |
|---|---|---|
| Логин/Регистрация | все | `/auth/login`, `/auth/register` |
| Создать заявку | CLIENT | `POST /orders` (+ `/uploads/cargo`, `/uploads/product`) |
| Мои заявки | CLIENT | `GET /orders`, `GET /orders/:id/track` (модалка трекинга) |
| Биржа | CARRIER | `GET /orders/available` + фильтры, `POST /orders/:id/accept` |
| Мои рейсы | CARRIER | `GET /orders` (присвоенные), `PATCH /orders/:id/status` (IN_TRANSIT/DELIVERED) |
| Парк машин | CARRIER | `GET/POST/PATCH/DELETE /vehicles`, `/carrier/apply` |
| Диспетчер (живая карта флота) | SUPERADMIN | WS `fleet` + `GET /vehicles` + `GET /telemetry/vehicle/:id/latest` + `GET /alerts?active=true` |
| Трекер одного заказа | все, кому доступен | `GET /orders/:id/track`, WS `subscribe:order`, `position:{vehicleId}` |
| Акимат-аналитика | SUPERADMIN | `GET /analytics/flows`, `/regional-summary`, `/economic` |
| Устройства | SUPERADMIN | `GET/POST/PATCH /devices` |

## 11. Нюансы
- После `POST /orders` заказ появляется в `SEARCHING`; перевозчик «берёт» через `/accept` (→ `ASSIGNED`); далее статусы двигает перевозчик/суперадмин.
- `GET /orders/:id/track` возвращает `latestReading` только после того, как устройство прислало телеметрию с привязкой к заказу.
- Пока нет реальных устройств — для демо можно вручную публиковать MQTT (см. `docs/mqtt-protocol.md`) или ждать наш симулятор.
- Аналитика считает по всем заказам в БД; пока в демо-данных чужие города (Dubai и т.п.) — они скоро заменятся на данные Мангистау.
