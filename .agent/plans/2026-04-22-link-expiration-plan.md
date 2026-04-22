# Current Plan: Link Expiration Updates

Date: 2026-04-22
Status: In progress
Owner: Codex + repository author

## Why This Plan Exists

This repository now has a `.agent/plans` directory and the intention is to keep an in-repo record of active work, not just discuss the plan in chat. This file is meant to capture the fuller working plan for the current link expiration effort so the implementation context is visible alongside the code changes.

## Current Task Summary

We are extending or refining expiration handling for shortened links. Based on the files already being edited, this work touches the API contract, repository interfaces, PostgreSQL persistence, redirect-time checks, observability DTOs, and related tests.

Active files already indicate that expiration-related behavior is being changed in:

- `src/link/interfaces.ts`
- `src/link/link.service.ts`
- `src/link/link.controller.ts`
- `src/link/dto/index.ts`
- `src/dao/interfaces.ts`
- `src/dao/dto/link.ts`
- `src/dao/pg-repository/link.repository.ts`
- `src/redirect/redirect.service.ts`
- `src/observability/dto/index.ts`
- `src/link/link.service.spec.ts`
- `src/redirect/redirect.service.spec.ts`
- `README.md`
- `env.test`

## Goal

Ensure expiration data is represented consistently and behaves correctly across the full request lifecycle:

1. when a link is created or updated
2. when expiration is stored and retrieved from PostgreSQL
3. when redirect resolution checks whether a link is still valid
4. when telemetry or DTOs expose expiration-related attributes
5. when tests and docs describe the expected behavior

## Desired Outcome

After this work:

- the link module exposes a clear expiration contract
- the repository reads and writes expiration fields without ambiguity
- redirect resolution rejects expired links consistently
- tests describe the intended edge cases
- docs and example configuration do not drift from the implemented behavior

## Working Assumptions

- `expires_at` remains the canonical persistence field in the database layer
- public API naming may differ from persistence naming, but mappings must be explicit
- soft deletion behavior should continue to work independently of expiration handling
- redirect caching must not allow expired links to remain incorrectly resolvable
- changes should fit the current NestJS module and repository patterns instead of introducing a new abstraction

## Scope

Included in scope:

- link-facing interfaces and DTOs
- service-layer mapping for expiration fields
- repository create/read/update behavior tied to expiration
- redirect lookup behavior for expired records
- observability DTOs or attributes impacted by expiration logic
- unit and integration-style test updates related to the changed behavior
- README and environment notes if examples or contracts changed

Out of scope unless the code review forces it:

- unrelated refactors in link or redirect modules
- broad redesign of repository abstractions
- schema changes beyond what is necessary for this expiration behavior
- non-expiration API redesign

## Detailed Plan

### 1. Reconstruct the current contract

Review the expiration-related flow end to end before finalizing edits:

- inspect `src/link/interfaces.ts` and link DTOs for how expiration is exposed at the module boundary
- inspect DAO interfaces and DTOs for the persistence-facing shape
- inspect repository implementation for insert, select, and update mapping
- inspect redirect service logic for runtime expiration checks
- inspect tests to see the currently expected behavior versus the intended behavior

Success condition:

- there is one clear understanding of the expiration contract at each layer and any mismatch is documented before more code is changed

### 2. Normalize naming and data flow

Align the types and mappings so expiration data flows cleanly from request to persistence to redirect lookup:

- confirm whether the application layer should use `expiresAt`, `expiration`, or another single field name
- keep snake_case and camelCase conversion explicit at boundaries
- avoid implicit partial objects that make expiration updates ambiguous
- ensure any selected repository method such as `updateExpiration` has a clear input and output contract

Success condition:

- a reader can trace expiration data through interfaces, DTOs, and repository code without guessing

### 3. Make repository behavior authoritative

Update PostgreSQL repository behavior so expiration persistence is correct and unsurprising:

- verify insert payloads write the correct column
- verify returned records map `expires_at` into the application shape consistently
- verify expiration update methods target the intended record and return predictable data
- verify deleted or inactive records are still handled according to existing repository conventions

Success condition:

- repository methods provide one stable source of truth for expiration reads and writes

### 4. Validate redirect-time behavior

Confirm redirect resolution handles expiration correctly in all relevant states:

- active link resolves normally
- expired link is treated as unavailable according to the existing domain error pattern
- soft-deleted link remains unavailable
- cache behavior does not bypass expiration checks incorrectly

Success condition:

- redirect behavior is correct whether the lookup comes from cache, database, or a miss path

### 5. Preserve observability and error semantics

If expiration behavior changes emitted attributes or error outcomes, update those surfaces intentionally:

- keep trace and metrics payloads aligned with current success and failure paths
- make sure domain errors still flow through the global exception filter consistently
- avoid changing public error semantics accidentally while refactoring internals

Success condition:

- expiration changes do not silently degrade telemetry or response stability

### 6. Lock the behavior down with tests

Update tests at the right level instead of relying on manual reasoning:

- link service tests for creation and expiration-related mapping
- repository-facing tests if persistence behavior changed materially
- redirect service tests for active versus expired cases
- any tests around cache interactions if expiration handling touches cached resolution

Success condition:

- the changed behavior is covered by focused tests that would fail on regression

### 7. Sync docs and examples

Refresh developer-facing documentation if the implementation changed the expected contract:

- update `README.md` examples or field descriptions
- update `env.test` or supporting config notes only if needed for the changed behavior
- call out any remaining mismatch instead of silently leaving docs stale

Success condition:

- docs no longer describe an outdated expiration shape or behavior

## Risks To Watch

- inconsistent field naming between controller, service, DAO, and database rows
- repository updates that write the column correctly but return the wrong mapped property
- redirect cache entries outliving expiration semantics
- tests passing with mocks while real repository mapping is still wrong
- docs implying expiration support that differs from the live API

## Verification Plan

Before considering the work done, verify:

1. TypeScript types compile for the touched link, DAO, and redirect modules.
2. Targeted tests covering link creation and redirect expiration behavior pass.
3. Repository mapping for `expires_at` is internally consistent.
4. Expired links no longer resolve through redirect paths.
5. README examples match the actual payload or behavior after the code changes.

## Notes

- `.agent/plans` did not previously define a naming convention, so this file uses a simple date-and-topic format.
- Existing worktree changes were already present when this plan file was created; this document is intended to track the work in progress rather than imply that all listed changes were created after the plan file.
- If the team adopts this pattern, future plan files should aim to include context, scope, assumptions, risks, and verification steps instead of only a short task summary.
