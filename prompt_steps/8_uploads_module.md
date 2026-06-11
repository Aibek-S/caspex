# 8. Uploads Module

This step adds a simple server-side file storage flow for avatars and order images. Files are stored on disk, exposed through static URLs, and their public URLs are saved in PostgreSQL.

## 1. Storage Model

Files are stored under:

- `uploads/avatars`
- `uploads/cargo`
- `uploads/products`

The Docker deployment mounts a named volume to `/app/uploads`, so files survive container rebuilds.

## 2. Public Access

Nest serves uploaded files from:

- `/uploads/*`

Example public URL:

```text
https://api-angels.byapex.dev/uploads/avatars/1718120000-uuid.jpg
```

When `PUBLIC_BASE_URL` is set, the API returns URLs based on that domain. Without it, the backend falls back to the current request host and protocol.

## 3. Database Fields

The upload module writes into existing fields:

- `User.avatarUrl`
- `Order.cargoPhotoUrl`
- `Order.productPhotoUrls`

No extra tables are required for the hackathon version.

## 4. Endpoints

All endpoints require a bearer token and accept `multipart/form-data`.

### `POST /uploads/avatar`

Field:

- `file`

Behavior:

- stores avatar image
- replaces `avatarUrl` for the current user
- deletes the previous local avatar file when possible

### `POST /uploads/cargo`

Fields:

- `orderId`
- `file`

Behavior:

- stores cargo image
- updates `cargoPhotoUrl` for the order
- deletes the previous local cargo image when possible

Access:

- order owner
- `SUPERADMIN`

### `POST /uploads/product`

Fields:

- `orderId`
- `file`

Behavior:

- stores product image
- appends its URL to `productPhotoUrls`

Access:

- order owner
- `SUPERADMIN`

## 5. Validation Rules

Accepted file types:

- `image/jpeg`
- `image/png`
- `image/webp`

Max file size:

- `8 MB`

Invalid type, missing file, or invalid payload returns `400`.

## 6. Docker Notes

`docker-compose.yml` mounts:

- `caspex_uploads_data:/app/uploads`

This is required so uploaded files are not lost on `docker compose up -d --build`.

## 7. Environment

Recommended:

```bash
PUBLIC_BASE_URL="https://api-angels.byapex.dev"
```

## 8. Frontend Usage

Frontend can immediately use returned URLs in image tags:

```text
<img src="https://api-angels.byapex.dev/uploads/avatars/..." />
```

The frontend does not need a separate media gateway for this version.
