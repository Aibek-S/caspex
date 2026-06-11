# 6. Tracking Module

This step adds order tracking history for CaspX. It introduces a dedicated tracking table, tracking endpoints under order routes, and automatic timeline events for important order lifecycle changes.

## 1. Database Schema

Added `OrderTracking`:

- `id`
- `orderId`
- `status`
- `location`
- `timestamp`
- `createdAt`

Relations:

- `Order.trackingEvents`
- `OrderTracking.order`

Status type:

- Reuses the existing `OrderStatus` enum.

Migration file:

- `prisma/migrations/20260611003000_add_order_tracking/migration.sql`

## 2. Tracking Module

Module:

- `src/tracking/`

Core pieces:

- `TrackingService`
  - Handles tracking visibility, tracking creation, transition validation and internal event recording.
- `OrderTrackingRepository`
  - Persists and lists timeline events ordered by timestamp.
- `TrackingController`
  - Exposes tracking endpoints under order routes.

Endpoints:

- `POST /orders/:id/tracking`
  - Creates a tracking event for an order.
  - Updates the current `order.status` to the provided tracking status.
- `GET /orders/:id/tracking`
  - Returns the order tracking timeline.

## 3. Access Rules

Read access:

- order owner (`CLIENT`)
- assigned carrier
- `SUPERADMIN`

Write access:

- assigned carrier
- `SUPERADMIN`

Regular clients cannot create tracking events for their own orders.

## 4. Automatic Timeline Events

Tracking is not only manual. The system also records timeline events automatically when:

- an order is created
  - writes `SEARCHING`
  - default location is the order `origin`
- an order is assigned to a carrier
  - writes `ASSIGNED`
  - default location is the order `origin`
- order status is updated through `PATCH /orders/:id/status`
  - writes a matching tracking event
  - delivered status defaults location to the order `destination`

This keeps `GET /orders/:id/tracking` aligned with the actual order lifecycle.

## 5. Transition Rules

Tracking rejects invalid movement:

- closed orders (`DELIVERED`, `CANCELLED`) cannot receive new tracking events
- status cannot move backwards
- `CANCELLED` is treated as a terminal state

Repeated forward-state updates such as multiple `IN_TRANSIT` events remain allowed for location refreshes.

## 6. Verification

Verified:

- `npx prisma format`
- `npx prisma generate`
- `npm run build`
- `npm test`

Local PostgreSQL is still required to apply the migration.
