# TechBlog

[![Run on Repl.it](https://repl.it/badge/github/Patryk-S-W/tech-blog-frontend)](https://repl.it/github/Patryk-S-W/tech-blog-frontend)

[![StackBlitz Demo](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Patryk-S-W/tech-blog-frontend)

![Angular21](https://img.shields.io/badge/Angular-21-brightgreen)
![Vercel](https://img.shields.io/github/deployments/Patryk-S-W/tech-blog-frontend/production.svg?logo=vercel&label=vercel)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Patryk-S-W_tech-blog-frontend&metric=alert_status)](https://sonarcloud.io/dashboard?id=Patryk-S-W_tech-blog-frontend)
[![codecov](https://codecov.io/gh/Patryk-S-W/tech-blog-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/Patryk-S-W/tech-blog-frontend)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
![GitHub last commit](https://img.shields.io/github/last-commit/Patryk-S-W/tech-blog-frontend.svg)
[![StackShare](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/Patryk-S-W/tech-blog-frontend)

TechBlog project is a fullstack application written in the Angular and .NET that is used to publish articles related to technology, programming and topics related to artificial intelligence.

## Dependencies

- Angular : 21.2
- Angular CLI : 21.2
- Angular SSR : 21.2
- Bootstrap : 5.3.0
- Fontawesome : 6.4.0

## System requirements

- Node 22 (>=22.13.0)
- Angular v21.2

## Features

- [x] [Angular 21](https://angular.io/)
- [x] [Jest](https://jestjs.io/) - Unit Testing
- [x] [TestCafé](https://testcafe.io/) - End-to-End Testing
- [x] [Transloco](https://github.com/ngneat/transloco) - Internationalization
- [x] [Compodoc](https://compodoc.app/) - Auto documentation
- [x] [Storybook](https://storybook.js.org/) - Provide component examples
- [x] [source-map-explorer](https://www.npmjs.com/package/source-map-explorer) - Analyse project
- [x] [Docker](https://www.docker.com/) - Containerization
- [x] [ESLint](https://eslint.org/)
- [x] [Prettier](https://prettier.io/)
- [x] [Commit Linting](https://github.com/conventional-changelog/commitlint)
- [x] [AuditJS](https://www.npmjs.com/package/auditjs) - Audit application using Sonatype OSS Index
- [x] [auto-changelog](https://github.com/cookpete/auto-changelog) - Auto-generate a CHANGELOG
- [x] Routing
- [x] Lazy Loading
- [x] [Server Side Rendering](https://www.npmjs.com/package/@angular/ssr)
- [x] [Progressive Web App](https://www.npmjs.com/package/@angular/pwa)
- [x] Responsive Layout
- [x] Search Engine Optimization (SEO)
- [x] Components
- [x] Services
- [x] Reactive Form
- [x] Atomic Design
- [x] Template Driven Forms
- [x] Search / Grid / Pagination

## Install / Development

```bash
# Clone the project
$ git clone https://github.com/Patryk-S-W/tech-blog-frontend
$ cd tech-blog-frontend

# Install dependencies
$ npm ci

# Start server
$ npm run start

# Open in browser: http://localhost:4200
```

## Docker Deployment

```bash
# Build Docker image
$ docker build . -t tech-blog

# Run Docker Container
$ docker run -p 3000:80 tech-blog
```

The image preserves Angular SSR behind nginx. API requests use the browser's
same origin; attach the container to the backend network with a `backend:8080`
service, or set `BACKEND_UPSTREAM` to the reachable backend host and port.
For host-network deployment, use `BACKEND_UPSTREAM=127.0.0.1:18080`.
The internal SSR listener binds to `127.0.0.1:4000` by default.

## Commands

- `npm run start` - Start the app
- `npm run lint` - Lint the project
- `npm run test` - Run unit tests
- `npm run build` - Build the project
- `npm run build:prod` - Build the project in production mode
- `npm run build:prod:stats` - Build the project in product mode with stats
- `npm run build:ssr` - Build the project with Server-Side Rendering
- `npm run analyze` - Analyse bundle with [webpack-bundle-analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- `npm run compodoc` - Generate [compodoc](https://github.com/compodoc/compodoc) documentation
- `npm run version` - Generate changelog
- `npm run prettier` - Format the whole project
- `npm run audit` - Audit this application using Sonatype OSS Index

## License

MIT License

Copyright (c) 2024 Patryk Sadowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Workspace architecture

Nx 24.0.6 runs the NgModule-based application in `apps/blog` and domain
libraries in `libs/{auth,articles,projects,shell,shared}`. Domain libraries
use `feature`, `data-access`, `ui`, `entity` and `util` tags. ESLint enforces
layer and domain boundaries; use `@blog/<domain>/<type>` public APIs rather
than importing private services or signal stores.

Components inject facades. HTTP-backed facade methods return promises that
resolve after the request and state update, or reject with safe errors.
Editor history and owner detail are route-scoped; public and owner article
collections are separate. Server-rendered root providers belong to each
Angular render, not to the Express process.

- `npm start`: serve `blog`.
- `npm test` / `npm run lint`: run all project targets serially.
- `npm run build:prod`: production SSR build, retaining `dist/tech-blog`.
- `npx nx graph`: inspect project dependencies locally.

CI sets `NX_DAEMON=false` and runs all lint/test/build targets with parallelism
one. No Nx Cloud or remote cache is configured. Docker still launches
`dist/tech-blog/server/server.mjs` behind nginx.
