FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends nginx gettext-base \
    && rm -rf /var/lib/apt/lists/* /etc/nginx/sites-enabled/default
WORKDIR /app
ENV NODE_ENV=production BACKEND_UPSTREAM=backend:8080 HOST=127.0.0.1 PORT=4000
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=builder /app/dist/tech-blog/ ./dist/tech-blog/
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/bin/bash", "/app/docker-entrypoint.sh"]
