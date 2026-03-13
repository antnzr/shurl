# syntax=docker/dockerfile:1.7

# ---------- base ----------
FROM node:24.13.0-alpine AS base

WORKDIR /app

RUN corepack enable


# ---------- deps (download dependencies only) ----------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch


# ---------- build ----------
FROM base AS build

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .

RUN pnpm build


# ---------- production ----------
FROM node:24.13.0-alpine AS production

WORKDIR /app

RUN corepack enable

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY knexfile.js ./knexfile.js
COPY db ./db

EXPOSE 3007

CMD ["node", "dist/main.js"]