FROM node:18-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
# Install production dependencies using the committed lockfile for deterministic installs
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:18-alpine AS runner
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3000
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD [ "node", "server.js" ]
