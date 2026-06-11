# 5. Orders Module & Superadmin Order Oversight

This step adds the first order workflow for CaspX. It introduces client-created cargo orders, carrier assignment, status progression, and a dedicated superadmin inspection layer.

## 1. Database Schema

Added `OrderStatus` enum:

- `NEW`
- `SEARCHING`
- `ASSIGNED`
- `IN_TRANSIT`
- `DELIVERED`
- `CANCELLED`

Added `Order`:

- `id`
- `clientId`
- `carrierId`
- `title`
- `cargoType`
- `weight`
- `volume`
- `origin`
- `destination`
- `comment`
- `estimatedPrice`
- `estimatedDeliveryTime`
- `estimatedCarrierSearchTime`
- `status`
- `createdAt`
- `updatedAt`

Relations:

- `User.orders`
- `Order.client`
- `CarrierProfile.orders`
- `Order.carrier`

Migration file:

- `prisma/migrations/20260611002000_add_orders/migration.sql`

## 2. Orders Module

Module:

- `src/orders/`

Endpoints:

- `POST /orders`
  - Creates an order for the current authenticated user.
  - Default status is `NEW`.
- `GET /orders`
  - Lists orders related to the current user.
- `GET /orders/my`
  - Alias for current user's related orders.
- `GET /orders/available`
  - Lists unassigned orders in `NEW` or `SEARCHING`.
- `GET /orders/:id`
  - Returns an order visible to the current user.
- `PATCH /orders/:id`
  - Updates own order details while status is `NEW` or `SEARCHING`.
- `PATCH /orders/:id/status`
  - Lets clients cancel and assigned carriers progress to `IN_TRANSIT` or `DELIVERED`.
- `PATCH /orders/:id/assign`
  - Assigns an available order to the current approved carrier profile.
- `DELETE /orders/:id`
  - Deletes own non-active order.

## 3. Superadmin Order Endpoints

Module:

- `src/superadmin/orders/`

Endpoints:

- `GET /superadmin/orders`
  - List orders with pagination and filters.
- `GET /superadmin/orders/:id`
  - Inspect a single order.
- `PATCH /superadmin/orders/:id`
  - Update order fields, status, or carrier assignment.
- `DELETE /superadmin/orders/:id`
  - Delete an order.

Filters for `GET /superadmin/orders`:

- `page`
- `limit`
- `clientId`
- `carrierId`
- `status`
- `cargoType`
- `search`

Search scope:

- order title
- cargo type
- origin
- destination
- comment
- client email/name
- carrier email/name

## 4. Verification

Verified:

- `npx prisma format`
- `npx prisma generate`
- `npm run build`
- `npm test`

PostgreSQL is still required locally to apply migrations.
