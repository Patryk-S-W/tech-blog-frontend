import { InjectionToken } from '@angular/core';

export const SERVER_API_URL = new InjectionToken<string>('SERVER_API_URL');

export function backendApiOrigin(upstream = 'backend:8080'): string {
  try {
    const value = upstream.includes('://') ? upstream : `http://${upstream}`;
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || !url.hostname || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash ||
      !/^https?:\/\/[^@/?#\s\\]+\/?$/i.test(value)) {
      throw new Error();
    }
    return url.origin;
  } catch {
    throw new Error('Invalid BACKEND_UPSTREAM: expected an HTTP(S) host and optional port');
  }
}
