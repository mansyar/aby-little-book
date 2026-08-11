# syntax=docker/dockerfile:1.7

# ---- Builder: pinned Node.js 24 LTS ----
FROM node:24.16.0-alpine AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- Runtime: pinned unprivileged Nginx ----
FROM nginxinc/nginx-unprivileged:1.31.3-alpine3.24

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY nginx-security-headers.conf /etc/nginx/security-headers.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

# BusyBox wget ships with the Alpine base; no extra runtime packages.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
