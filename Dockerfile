FROM node:22-alpine AS build
WORKDIR /app
ARG BUILD_CACHE_BUST=20260908-2
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 9800
CMD ["node", "dist/index.js"]
