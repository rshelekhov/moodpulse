FROM oven/bun:1-debian AS deps

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-debian AS build

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY src/infrastructure/prisma/schema.prisma src/infrastructure/prisma/schema.prisma
RUN bunx --bun prisma generate --schema src/infrastructure/prisma/schema.prisma

FROM oven/bun:1-debian AS release

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/node_modules/.prisma node_modules/.prisma
COPY package.json ./
COPY src src
COPY scripts/entrypoint.sh scripts/entrypoint.sh

RUN chown -R bun:bun /app
USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["sh", "scripts/entrypoint.sh"]
