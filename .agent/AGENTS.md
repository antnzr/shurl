# AGENTS.md

## Purpose

This repository contains `shurl`, a NestJS + Fastify URL shortener service.
It exposes a small HTTP API for creating short links and resolving them via redirect.
The system uses:

- PostgreSQL for durable link storage
- Redis for redirect-result caching
- OpenTelemetry, Prometheus, Tempo, Grafana, and Alertmanager for observability

This document is the operating guide for humans and coding agents working in this repository. It should be treated as the source of truth for repo-specific engineering expectations.

## Product Scope

The current application surface is intentionally small:

- `GET /health`
  Returns a simple health response.
- `POST /api/v1/links`
  Creates a short link from a validated URL payload.
- `GET /:code`
  Resolves a short code and returns an HTTP redirect to the original URL.
- `GET /api/docs`
  Swagger UI for the service API.

This service is API-first. There is no frontend application in this repository.

## Architecture Summary

The service is organized by module and dependency injection token rather than by large shared service classes.

- `src/main.ts`
  Bootstraps Nest with Fastify, global validation, global exception filter, Swagger, CORS, shutdown hooks, and URI versioning.
- `src/app.module.ts`
  Composes the top-level modules.
- `src/link`
  Link creation flow.
- `src/redirect`
  Redirect resolution flow.
- `src/dao`
  Database access through Knex repositories.
- `src/redis`
  Redis client lifecycle and cache abstraction.
- `src/code-generator`
  Random short-code generation.
- `src/observability`
  Application metrics and trace annotations.
- `src/common`, `src/filter`, `src/decorators`
  Error handling and API response metadata.

Core request flow:

1. Client sends `POST /api/v1/links` with a URL.
2. `LinkService` generates a short code and persists the record in PostgreSQL.
3. If a unique code collision occurs, creation is retried up to 5 times.
4. Client later calls `GET /:code`.
5. `RedirectService` checks Redis first.
6. On cache miss, it reads from PostgreSQL, validates expiration/deletion state, and returns the original URL.
7. The controller sends a `302 Found` redirect.

## Data Model

Primary table: `links`

Defined via Knex migration under `db/migrations`.

Important fields:

- `id`
- `code`
- `original_url`
- `expires_at`
- `deleted_at`
- `created_at`
- `updated_at`

Behavioral notes:

- Active links are enforced by a partial unique index on `code` where `deleted_at IS NULL`.
- Repository lookups already filter out soft-deleted links.
- Redirect resolution only needs `original_url` and `expires_at`, and is optimized accordingly.

## Runtime and Environment

The app expects the following environment variables at runtime:

- `NODE_ENV`
- `PORT`
- `ADDR`
- `DATABASE_URL`
- `REDIS_URL`

When changing configuration behavior, treat the code in `src/config` as authoritative unless you are explicitly fixing the configuration contract across the repo.

## Local Development

Primary commands:

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`
- `npm run db:migrate`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`

Containerized local stack:

- `compose.yml` defines Postgres, Redis, the app, and the observability stack.
- The application container runs migrations before starting the production server.

When developing locally, prefer validating:

1. type correctness
2. lint
3. targeted unit/integration tests
4. then broader test runs if the change is cross-cutting

## Testing Strategy

Tests are a mix of service-level tests and infrastructure-backed integration tests.

- Unit/service tests live alongside source files as `*.spec.ts`.
- E2E and infra helpers live under `test/`.
- Testcontainers-based infra setup is implemented in `test/infra.ts`.

Testing guidance:

- If you modify link creation, run the link service tests.
- If you modify redirect behavior, run the redirect service tests.
- If you change providers, config wiring, or bootstrapping, run broader test coverage.
- If you change migrations or repository behavior, prefer integration tests over pure mocks.

Known repo caveat:

- `test/app.e2e-spec.ts` is stale relative to the current application behavior and should not be treated as a reliable description of the live API.

## Coding Standards for This Repo

Follow the existing patterns in the codebase instead of introducing a new style per feature.

### Service boundaries

- Keep controllers thin.
- Put business behavior in services.
- Put SQL access in repositories under `src/dao`.
- Keep Redis interaction behind `ICacheService`.

### Dependency injection

- Use the existing injection token pattern from `src/constants` and `src/utils/injecters.ts`.
- If you add a new service, wire it through the relevant module provider list explicitly.

### Error handling

- Prefer explicit domain errors for business conditions.
- Ensure new errors integrate with the global exception filter.
- Preserve structured error responses.

### DTOs and validation

- Validate external input with `class-validator`.
- Keep API DTOs separate from persistence DTOs.
- Use existing transformation patterns for snake_case to camelCase boundaries.

### Persistence

- Keep database changes backward-compatible when possible.
- Add or update Knex migrations for schema changes.
- Do not hide schema assumptions inside service logic when they belong in constraints or indexes.

### Caching

- Cache only values safe to replay.
- Be deliberate with TTL changes.
- When mutating behavior that affects redirect resolution, check whether Redis invalidation or key versioning is needed.

### Observability

- Preserve existing tracing and metric hooks around core operations.
- New critical flows should emit metrics and trace attributes consistent with the current observability model.

## Production Readiness Expectations

Changes merged into this service should be defensible from an operational perspective, not only compile successfully.

Minimum standard for non-trivial changes:

- clear behavior and ownership in code
- validation at input boundaries
- structured error handling
- tests at the right level
- no silent config contract changes
- no accidental weakening of observability
- no avoidable data consistency regressions

Before considering a change production-ready, verify:

1. startup configuration still validates correctly
2. migrations are safe and reversible where appropriate
3. Redis behavior is still correct for stale and missing data
4. error responses remain structured and stable
5. telemetry still captures the main success and failure paths

## Change Guidance for Agents

When making changes in this repository:

1. Read the relevant module end-to-end before editing.
2. Prefer the smallest coherent change that matches the established architecture.
3. Update tests when behavior changes.
4. Call out mismatches between code, env files, docs, and tests instead of silently choosing one.
5. Do not replace repository patterns with new abstractions unless the task explicitly requires a refactor.

Avoid:

- bypassing repositories with ad hoc SQL in services
- bypassing validation for external input
- adding broad global behavior for a local problem
- introducing hidden runtime requirements without documentation
- changing public API contracts without updating Swagger and tests

## High-Risk Areas

Extra care is required when editing:

- `src/main.ts`
  Affects global routing, validation, filters, and startup behavior.
- `src/config/*`
  Affects environment contracts and production boot.
- `src/dao/*` and `db/migrations/*`
  Affects persistence and compatibility.
- `src/redis/*`
  Affects redirect latency and cache correctness.
- `src/filter/app.exception-filter.ts`
  Affects all error responses.
- `src/config/telemetry.ts` and `src/observability/*`
  Affects tracing and metrics across the service.

## Documentation Maintenance

If a change alters any of the following, update this file in the same change set:

- runtime environment contract
- service endpoints
- module boundaries
- testing expectations
- operational behavior
- production assumptions

This file should stay concise, accurate, and operationally useful. If it drifts from the code, update it.
