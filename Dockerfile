# 1. Dependencies for building
FROM node:22-bookworm-slim AS build-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the application
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY --from=build-deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Dependencies for production ONLY
FROM node:22-bookworm-slim AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 4. Deploy
FROM node:22-bookworm-slim AS deploy
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Copy only what is strictly necessary for runtime
COPY --from=build /app/package.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN mkdir logs && chown node:node logs

USER node

EXPOSE 3000

# Run node directly for proper signal handling (graceful shutdowns)
# Make sure to point this to your actual compiled entry file!
CMD [ "node", "dist/index.js" ]
