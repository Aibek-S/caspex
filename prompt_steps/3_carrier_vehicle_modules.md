# 3. Carrier Profile & Vehicle Modules

This step adds the first logistics domain layer after authentication and superadmin setup. It introduces carrier profiles and vehicles with the relation `User -> CarrierProfile -> Vehicle[]`.

## 1. Database Schema

Added `CarrierProfile`:

- `id`
- `userId`
- `experienceYears`
- `transportType`
- `description`
- `isApproved`
- `createdAt`
- `updatedAt`

Added `Vehicle`:

- `id`
- `carrierId`
- `type`
- `brand`
- `model`
- `year`
- `plateNumber`
- `capacityTons`
- `cargoVolume`
- `vehicleImageUrl`
- `createdAt`
- `updatedAt`

Relations:

- `User.carrierProfile`
- `CarrierProfile.user`
- `CarrierProfile.vehicles`
- `Vehicle.carrier`

Migration file:

- `prisma/migrations/20260611001000_add_carrier_profile_and_vehicle/migration.sql`

## 2. Carrier Module

Module:

- `src/carrier/`

Endpoints:

- `POST /carrier/apply`
  - Creates a carrier profile for the current authenticated user.
  - If the user role is `CLIENT`, it upgrades the user role to `CARRIER`.
  - New profiles are created with `isApproved=false`.
- `GET /carrier/profile`
  - Returns the current user's carrier profile.
- `PATCH /carrier/profile`
  - Updates the current user's carrier profile.

## 3. Vehicles Module

Module:

- `src/vehicles/`

Endpoints:

- `POST /vehicles`
  - Creates a vehicle under the current user's carrier profile.
- `GET /vehicles`
  - Lists vehicles under the current user's carrier profile.
- `PATCH /vehicles/:id`
  - Updates an owned vehicle.
- `DELETE /vehicles/:id`
  - Deletes an owned vehicle.

Ownership behavior:

- Vehicles are always scoped to the authenticated user's `CarrierProfile`.
- Users without a carrier profile receive `404 Carrier profile not found`.
- Vehicle update/delete requires the vehicle to belong to the current user's carrier profile.

## 4. Swagger

Added Swagger tags:

- `Carrier`
- `Vehicles`

Both modules use Bearer JWT auth and document:

- request DTOs
- success responses
- validation errors
- ownership/not-found errors
- duplicate vehicle plate conflicts

## 5. Verification

Verified:

- `npx prisma format`
- `npx prisma generate`
- `npm run build`

Migration note:

- `npx prisma migrate dev --name add_carrier_profile_and_vehicle` requires PostgreSQL to be reachable.
- During implementation, local PostgreSQL at `localhost:5432` was not reachable, so the migration file was created but not applied.
