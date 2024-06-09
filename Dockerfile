# Static content Dockerfile

# Builder image (https://hub.docker.com/layers/library/node/20.12.2-alpine3.18/images/sha256-5cfa23de5d7e5e6226dea49eab15fdf4e53fde84b8feccbce97aa27695242bb9?context=explore)
FROM node:20.12.2-alpine3.18@sha256:d328c7bc3305e1ab26491817936c8151a47a8861ad617c16c1eeaa9c8075c8f6 AS builder

# Install packages
RUN apk add --no-cache git

# Set working directory
WORKDIR /build

# Copy source code
COPY . .

# Install production dependencies
RUN npm install --omit=dev

# Build static content
RUN npm run build

# Base image (https://hub.docker.com/layers/library/caddy/2.7.6-alpine/images/sha256-a6054d207060158cd0f019d6a35907bf47d1f8dacf58cdb63075a930d8ebca38?context=explore)
FROM caddy:2.8.1-alpine@sha256:54b067d60ae306670ab09f10b6f309f19e4e0f43927ae514d3740fbe7964872f

# Install packages
RUN apk add --no-cache wget

# Remove old files
RUN rm -rf /etc/caddy/Caddyfile /usr/share/caddy

# Create the non-root user
RUN adduser -D caddy
USER caddy

# Copy files
COPY --from=builder /build/Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /build/dist /usr/share/caddy

# Expose port
EXPOSE 8080

# Run Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]

# Health check (Note: the server grace period is 30 seconds)
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=2 CMD wget --quiet --tries=1 --spider http://localhost:8081 || exit 1
