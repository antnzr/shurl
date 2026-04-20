# SHURL

SHURL is a small URL shortener API built with NestJS and Fastify. It creates short codes for long URLs, stores link metadata in PostgreSQL, and resolves redirects through a Redis-backed cache.

## Features

- Create short links through a versioned REST API
- Redirect `GET /:code` requests to the original URL
- PostgreSQL persistence with Knex migrations
- Redis caching for link resolution
- Swagger docs at `GET /api/docs`
- OpenTelemetry, Prometheus, Grafana, Tempo, and Alertmanager wiring for local observability
- Unit and e2e test setup

## Stack

- Node.js 24
- NestJS 11 with Fastify
- PostgreSQL
- Redis
- Knex
- Swagger / OpenAPI
- OpenTelemetry
- Jest + Testcontainers
- Docker Compose

## Requirements

- Node.js 24+
- `pnpm`
- Docker and Docker Compose

## Environment Variables

Copy `env.example` to `.env` and adjust values if needed.

```env
NODE_ENV=development
PORT=3007
ADDR=0.0.0.0
DATABASE_URL=postgresql://shurl:postgres@localhost:5432/shurl
REDIS_URL=redis://:redis@shurl_redis:6379
```

Required variables:

- `NODE_ENV`
- `DATABASE_URL`
- `REDIS_URL`

Optional variables:

- `PORT` defaults to `3007`
- `ADDR` defaults to `0.0.0.0`

Validation is enforced on boot in [`src/config/validate.ts`](/home/antoine/dev/node/shurl/src/config/validate.ts).

## Running Locally

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create `.env`

```bash
cp env.example .env
```

### 3. Start the stack

Start the local stack with Docker Compose:

```bash
docker compose up --build
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

If you run migrations from your host instead of inside the container, update `DATABASE_URL` in `.env` to use the published PostgreSQL port:

```env
DATABASE_URL=postgresql://shurl:postgres@localhost:35121/shurl
```

## Running With Docker Compose

To start the full local stack, including the app and observability services:

```bash
docker compose up --build
```

This path relies on `.env`, especially for `REDIS_URL` and optional Alertmanager Telegram settings.

Included services:

- `shurl_app`
- `shurl_db`
- `shurl_redis`
- `otel_collector`
- `tempo`
- `grafana`
- `prometheus`
- `alertmanager`

Useful local ports:

- App: `3007`
- Grafana: `3000`
- Prometheus: `9090`
- Alertmanager: `9093`
- Tempo: `3200`
- OTLP HTTP: `4318`

## API Overview

Base API prefix: `/api`
Versioned endpoints use `/api/v1/...`

### Health Check

```http
GET /health
```

Returns:

```text
OK
```

### Create Short Link

```http
POST /api/v1/links
Content-Type: application/json
```

Request body:

```json
{
  "url": "https://example.com"
}
```

Example:

```bash
curl -X POST http://localhost:3007/api/v1/links \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://example.com"}'
```

Response shape:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "code": "abc1234",
  "originalUrl": "https://example.com",
  "createdAt": "2026-04-20T10:00:00.000Z",
  "updatedAt": "2026-04-20T10:00:00.000Z",
  "deletedAt": null,
  "expiresAt": null
}
```

Implementation notes:

- Short codes are generated with secure random bytes
- Default code length is `7`
- Link creation retries up to `5` times on unique-code collisions

### Resolve Redirect

```http
GET /:code
```

Example:

```bash
curl -i http://localhost:3007/abc1234
```

Expected behavior:

- Returns `302 Found` when the code exists
- Returns an error when the code does not exist
- Returns an error when the link has expired

## API Docs

Swagger UI is available at:

```text
http://localhost:3007/api/docs
```

## Data Model

The initial migration creates a `links` table with:

- `id` UUID primary key
- `code` short code
- `original_url` destination URL
- `expires_at` optional expiration time
- `deleted_at` soft-delete timestamp
- `created_at`
- `updated_at`

There is also a unique partial index on `code` for non-deleted links.

## Caching

Redirect resolution is cached in Redis under the `link_resolve` namespace with a default TTL of `3600` seconds.

## Testing

- Unit tests live next to source files as `*.spec.ts`
- e2e tests live in [`test/`](/home/antoine/dev/node/shurl/test)
- Jest global setup/teardown brings infrastructure up and down through Testcontainers

## Project Structure

```text
src/
  link/             link creation API
  redirect/         redirect resolution
  dao/              data access and repositories
  redis/            cache abstraction
  observability/    metrics and operation tracking
  config/           app, logger, swagger, telemetry config
db/migrations/      database schema migrations
test/               e2e and infra setup
```

## Notes

- The global API prefix excludes `/health` and `/:code`
- CORS is enabled
- Request validation is applied globally
- Telemetry is initialized on app startup from [`src/config/telemetry.ts`](/home/antoine/dev/node/shurl/src/config/telemetry.ts)
