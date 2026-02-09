#!/bin/sh
set -e

echo "DATABASE_URL=${DATABASE_URL}" > .env

echo "Running database migrations..."
bunx --bun prisma migrate deploy --schema src/infrastructure/prisma/schema.prisma

echo "Starting bot..."
exec bun run src/index.ts
