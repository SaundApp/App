FROM node:18 AS base

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# The web Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update this Dockerfile, the Dockerfile in the web workspace and copy that over to Dockerfile in the docs.

FROM base AS builder
# Set working directory
WORKDIR /app

RUN npm i -g turbo
COPY . .
RUN turbo prune @repo/ws-server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/backend-common/prisma ./backend-common/prisma
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN --mount=type=cache,target=/root/.yarn YARN_CACHE_FOLDER=/root/.yarn yarn install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN
RUN yarn turbo build --filter=@repo/ws-server...

FROM oven/bun:latest AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system hono
RUN adduser --system hono
USER hono

COPY --from=installer /app .
COPY ./translations /translations

EXPOSE 3000
CMD bun run ws-server/dist/server.js
