FROM node:18-slim

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Copy files as a non-root user. The `node` user is built in the Node image.

USER node
WORKDIR /usr/src/app
RUN chown node:node ./

# Install dependencies first, as they change less often than code.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts && npm cache clean --force
COPY ./src ./src

# Execute NodeJS (not NPM script) to handle SIGTERM and SIGINT signals.
CMD ["node", "./src/index.js"]

FROM nginx:1.25.3-alpine-slim

USER nginx

COPY --from=builder /usr/src/app/dist/tech-blog/ /usr/share/nginx/html