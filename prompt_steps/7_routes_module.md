# 7. Routes Module

This step adds route calculation through OpenRouteService. It stores calculated route geometry in PostgreSQL and exposes a single endpoint that returns JSON ready for map rendering.

## 1. Database Schema

Added `Route`:

- `id`
- `orderId`
- `distanceKm`
- `durationMinutes`
- `geometry`
- `createdAt`

Relations:

- `Order.routes`
- `Route.order`

Storage format:

- `geometry` is stored as Prisma `Json`
- expected shape is GeoJSON `LineString`

Migration files:

- `prisma/migrations/20260611007000_add_routes_table/migration.sql`

## 2. Routes Module

Module:

- `src/routes/`

Core pieces:

- `RoutesService`
  - Resolves coordinates from request body or from the linked order
  - Calls OpenRouteService
  - Validates returned route payload
  - Persists the calculated route
- `RoutesRepository`
  - Saves route records into PostgreSQL
- `RoutesController`
  - Exposes the route calculation endpoint

Endpoint:

- `POST /routes/calculate`
  - Calculates a route with OpenRouteService
  - Saves the route in the `Route` table
  - Returns `distanceKm`, `durationMinutes`, and `geometry`

## 3. Request Modes

The endpoint supports two ways to calculate a route.

Mode 1: explicit coordinates

```json
{
  "startLat": 43.65,
  "startLng": 51.17,
  "endLat": 40.37,
  "endLng": 49.89
}
```

Mode 2: order-based calculation

```json
{
  "orderId": "cmmi83qoc00000kirq90ord"
}
```

When `orderId` is provided and coordinates are omitted, the service reads:

- `order.originLat`
- `order.originLng`
- `order.destinationLat`
- `order.destinationLng`

## 4. Response Shape

Response example:

```json
{
  "routeId": "cmroute123",
  "orderId": "cmmi83qoc00000kirq90ord",
  "distanceKm": 682.12,
  "durationMinutes": 740.53,
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [51.17, 43.65],
      [49.89, 40.37]
    ]
  }
}
```

This `geometry` payload can be used directly in map libraries such as Leaflet.

## 5. Access Rules

Order-based route calculation is allowed for:

- order owner (`CLIENT`)
- assigned carrier
- `SUPERADMIN`

If an `orderId` is provided but the order is not visible to the current user, the endpoint returns `404`.

## 6. Error Handling

The module validates and handles the main failure cases:

- missing usable coordinates
  - returns `400`
- order not found
  - returns `404`
- order exists but has no saved route coordinates
  - returns `400`
- `OPENROUTESERVICE_API_KEY` is missing
  - returns `500`
- OpenRouteService request fails
  - returns `502`
- OpenRouteService returns malformed route payload
  - returns `502`

## 7. Environment

Required environment variables:

- `OPENROUTESERVICE_API_KEY`
- `OPENROUTESERVICE_BASE_URL`

Expected base URL example:

```bash
OPENROUTESERVICE_BASE_URL="https://api.openrouteservice.org"
```

## 8. Verification

Verified:

- `npx prisma generate`
- `npm run build`
- `npm test -- --runInBand`

Swagger:

- UI: `/docs`
- JSON: `/docs-json`
