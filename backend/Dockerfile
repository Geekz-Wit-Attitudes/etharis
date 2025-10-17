FROM oven/bun:1.2.2
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

COPY prisma ./prisma
COPY src ./src
COPY .env .env

EXPOSE 3000
CMD ["sh", "-c", "bunx prisma generate && bun run src/index.ts"]
