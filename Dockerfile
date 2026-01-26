# Install dependencies only when needed
FROM node:22-slim AS deps

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json ./
RUN npm i

# Rebuild the source code only when needed
FROM node:22-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./
COPY --from=deps /app/package-lock.json ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# pull official base image
FROM node:22-slim AS runner

# set working directory
WORKDIR /app

ENV NODE_ENV production

ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# start app
ENTRYPOINT ["node", "server.js"]
