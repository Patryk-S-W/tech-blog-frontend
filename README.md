# TechBlog

[![Run on Repl.it](https://repl.it/badge/github/Patryk-S-W/tech-blog-frontend)](https://repl.it/github/Patryk-S-W/tech-blog-frontend)

[![StackBlitz Demo](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Patryk-S-W/tech-blog-frontend)

![Angular17](https://img.shields.io/badge/Angular-17-brightgreen)
![Vercel](https://img.shields.io/github/deployments/Patryk-S-W/tech-blog-frontend/production.svg?logo=vercel&label=vercel)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Patryk-S-W_tech-blog-frontend&metric=alert_status)](https://sonarcloud.io/dashboard?id=Patryk-S-W_tech-blog-frontend)
[![codecov](https://codecov.io/gh/Patryk-S-W/tech-blog-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/Patryk-S-W/tech-blog-frontend)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
![GitHub last commit](https://img.shields.io/github/last-commit/Patryk-S-W/tech-blog-frontend.svg)
[![StackShare](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](https://stackshare.io/Patryk-S-W/tech-blog-frontend)

TechBlog project is a fullstack application written in the Angular and .NET that is used to publish articles related to technology, programming and topics related to artificial intelligence.

## Dependencies

- Angular : 17.1.0
- Angular CLI : 17.1.0
- Angular SSR : 17.1.0
- Bootstrap : 5.3.0
- Fontawesome : 6.4.0

## System requirements

- Node v18+
- Angular v17.1.0+

## Features

- [x] [Angular 17](https://angular.io/)
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
$ npm install

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
