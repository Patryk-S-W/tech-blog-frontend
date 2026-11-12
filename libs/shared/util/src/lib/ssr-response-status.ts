import { InjectionToken } from '@angular/core';

export const SSR_RESPONSE_STATUS = new InjectionToken<{ statusCode: number } | null>(
  'SSR_RESPONSE_STATUS',
  { providedIn: 'root', factory: () => null }
);
