FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
# Use npm install instead of npm ci to avoid failures when package-lock.json
# is missing or incompatible with the npm version in the build image.
RUN npm install --omit=dev --no-audit --no-fund

# Copy app source
COPY . ./

# Expose port
EXPOSE 3000

# Use a non-root user for safety
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD [ "node", "server.js" ]
