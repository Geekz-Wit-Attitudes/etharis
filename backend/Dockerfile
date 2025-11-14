FROM oven/bun:1.2.2
WORKDIR /app

# Copy package files
COPY backend/package.json backend/bun.lock ./

RUN bun install

# Copy parent tsconfig
COPY tsconfig.base.json ./tsconfig.base.json
    
# Copy application files
COPY backend/src ./src
COPY backend/prisma ./prisma
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/bunfig.toml ./bunfig.toml

# Copy smartcontract
COPY smartcontract/ignition ./smartcontract/ignition
COPY smartcontract/artifacts ./smartcontract/artifacts

# Extends path and update path aliases for Docker
RUN sed -i 's|"extends": "../tsconfig.base.json"|"extends": "./tsconfig.base.json"|g' tsconfig.json && \
    sed -i 's|"backend/src/\*"|"src/*"|g' tsconfig.base.json

# Generate Prisma client
RUN bunx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["bun", "run", "src/index.ts"]