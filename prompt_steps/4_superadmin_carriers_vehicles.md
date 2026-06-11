# 4. Superadmin Carrier & Vehicle Oversight

This step adds dedicated superadmin inspection endpoints for carrier profiles and vehicles. The goal is to keep regular owner-facing CRUD in `carrier/` and `vehicles/`, while giving the platform owner a separate moderation/debugging layer.

## 1. Superadmin Module Structure

Added submodules under `src/superadmin/`:

- `carriers/`
- `vehicles/`

Root superadmin module now imports these submodules alongside the existing user-management controller.

## 2. Superadmin Carrier Endpoints

Controller:

- `src/superadmin/carriers/controllers/superadmin-carriers.controller.ts`

Endpoints:

- `GET /superadmin/carriers`
  - List carrier profiles for moderation and debugging.
- `PATCH /superadmin/carriers/:id/approval`
  - Update `isApproved` for a carrier profile.

Filters for `GET /superadmin/carriers`:

- `page`
- `limit`
- `isApproved`
- `transportType`
- `search`

Search scope:

- carrier `transportType`
- carrier `description`
- carrier user `email`
- carrier user `firstName`
- carrier user `lastName`
- carrier user `phone`
- carrier user `companyName`

List response includes:

- carrier profile data
- linked user data
- `vehiclesCount`
- pagination meta

## 3. Superadmin Vehicle Endpoints

Controller:

- `src/superadmin/vehicles/controllers/superadmin-vehicles.controller.ts`

Endpoint:

- `GET /superadmin/vehicles`
  - List vehicles for inspection and debugging.

Filters for `GET /superadmin/vehicles`:

- `page`
- `limit`
- `carrierId`
- `type`
- `brand`
- `plateNumber`
- `search`

Search scope:

- vehicle `type`
- vehicle `brand`
- vehicle `model`
- vehicle `plateNumber`
- carrier user `email`
- carrier user `firstName`
- carrier user `lastName`

List response includes:

- vehicle data
- carrier user data
- pagination meta

## 4. Swagger

Added Swagger tags:

- `Superadmin Carriers`
- `Superadmin Vehicles`

Query parameters are exposed explicitly with `@ApiQuery` so the filter fields are visible in Swagger UI.

Carrier approval endpoint documents:

- bearer auth
- validation errors
- forbidden access for non-superadmins
- not found when carrier profile does not exist

## 5. Verification

Verified:

- `npm run build`
- `npm test`

The local PostgreSQL instance is still required to apply the migration for carrier and vehicle tables through Prisma.
