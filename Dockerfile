# Static content Dockerfile

# Builder image (https://hub.docker.com/layers/library/node/20.12.2-alpine3.18/images/sha256-5cfa23de5d7e5e6226dea49eab15fdf4e53fde84b8feccbce97aa27695242bb9?context=explore)
FROM node:22.2.0-alpine3.18@sha256:a46d9fcb38cae53de45b35b90f6df232342242bebc9323a417416eb67942979e AS builder

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
FROM caddy:2.8.4-alpine@sha256:e97e0e3f8f51be708a9d5fadbbd75e3398c22fc0eecd4b26d48561e3f7daa9eb

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
