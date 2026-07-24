FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:prod

FROM node:22-slim AS final
WORKDIR /app
COPY --from=build /app/dist/tech-blog ./dist/tech-blog
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 4000
ENV NODE_ENV=production
ENV PORT=4000
CMD ["node", "dist/tech-blog/server/server.mjs"]
