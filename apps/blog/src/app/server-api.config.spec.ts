import { backendApiOrigin } from './server-api.config';

describe('SSR backend origin', () => {
  it('uses the deployment default and accepts explicit loopback origins', () => {
    expect(backendApiOrigin()).toBe('http://backend:8080');
    expect(backendApiOrigin('127.0.0.1:18080')).toBe('http://127.0.0.1:18080');
    expect(backendApiOrigin('https://127.0.0.1:18080/')).toBe('https://127.0.0.1:18080');
  });

  it.each([
    '', 'ftp://127.0.0.1', 'http://@127.0.0.1',
    'http://127.0.0.1/api', 'http://127.0.0.1/?query',
    'http://127.0.0.1/#fragment', 'http://127.0.0.1?',
    'http://127.0.0.1\\path', 'http://127.0.0.1:invalid',
    ' http://127.0.0.1',
  ])('rejects invalid configuration without including its value: %s', (upstream) => {
    expect(() => backendApiOrigin(upstream))
      .toThrow('Invalid BACKEND_UPSTREAM: expected an HTTP(S) host and optional port');
  });
});
