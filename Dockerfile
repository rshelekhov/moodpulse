FROM oven/bun:1-debian AS deps

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM oven/bun:1-debian AS build

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY prisma.config.ts ./
COPY src/infrastructure/prisma/schema.prisma src/infrastructure/prisma/schema.prisma
RUN bunx --bun prisma generate --schema src/infrastructure/prisma/schema.prisma

FROM oven/bun:1-debian AS release

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=deps --chown=bun:bun /app/node_modules node_modules
COPY --from=build --chown=bun:bun /app/node_modules/.prisma node_modules/.prisma
COPY --from=build --chown=bun:bun /app/node_modules/prisma node_modules/prisma
COPY --chown=bun:bun package.json prisma.config.ts ./
COPY --chown=bun:bun src src
COPY --chown=bun:bun scripts/entrypoint.sh scripts/entrypoint.sh

USER bun
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

ENTRYPOINT ["sh", "scripts/entrypoint.sh"]
