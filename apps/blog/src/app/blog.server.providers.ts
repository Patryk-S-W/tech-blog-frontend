import { EnvironmentProviders, Provider, inject, provideZoneChangeDetection } from '@angular/core';
import { API_URL, SSR_RESPONSE_STATUS } from '@blog/shared/util';
import { SERVER_API_URL, backendApiOrigin } from './server-api.config';

export function provideBlogServer(): (Provider | EnvironmentProviders)[] {
  return [
    provideZoneChangeDetection(),
    {
      provide: API_URL,
      useFactory: () => inject(SERVER_API_URL, { optional: true }) ??
        backendApiOrigin(process.env['BACKEND_UPSTREAM']),
    },
    {
      provide: SSR_RESPONSE_STATUS,
      // Read the per-render platform response instead of the browser token's root default.
      useFactory: () => inject(SSR_RESPONSE_STATUS, { skipSelf: true, optional: true }),
    },
  ];
}
