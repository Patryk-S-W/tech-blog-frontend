import { dirname, join, resolve } from 'node:path';

import { APP_BASE_HREF } from '@angular/common';
import AppServerModule from './src/main.server';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { SSR_RESPONSE_STATUS } from '@blog/shared/util';
import { SERVER_API_URL, backendApiOrigin } from './src/app/server-api.config';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const apiUrl = backendApiOrigin(process.env['BACKEND_UPSTREAM']);
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine({
    allowedHosts: [
      'patryksadowski.pl',
      'www.patryksadowski.pl',
      'localhost',
      '127.0.0.1',
    ],
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: false,
    })
  );

  // All regular routes use the Angular engine
  server.get('/{*path}', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: SERVER_API_URL, useValue: apiUrl },
          { provide: SSR_RESPONSE_STATUS, useValue: res },
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;
  const host = process.env['HOST'] || '127.0.0.1';

  // Start up the Node server
  const server = app();
  server.listen(Number(port), host, () => {
    console.log(`Node Express server listening on http://${host}:${port}`);
  });
}

run();
