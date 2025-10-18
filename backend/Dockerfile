FROM oven/bun:1.2.2
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY prisma ./prisma
COPY src ./src
COPY .env .
COPY tsconfig.json tsconfig.json
COPY bunfig.toml bunfig.toml

EXPOSE 3000
CMD ["sh", "-c", "bunx prisma generate && bun run src/index.ts"]
