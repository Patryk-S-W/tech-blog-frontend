import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthFacade } from '../auth.facade';
import { authGuard } from '../guards/auth.guard';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { API_URL } from '@blog/shared/util';
const environment = { apiUrl: '' };

describe('authentication flow', () => {
  const loginUrl = `${environment.apiUrl}/api/auth/login`;
  function jwt(exp: unknown): string {
    const encode = (value: object) => btoa(JSON.stringify(value))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({
      exp,
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': 'test-user',
    })}.test-signature`;
  }
  function setup(platform = 'browser', apiUrl = ''): AuthService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: platform },
        { provide: API_URL, useValue: apiUrl },
      ],
    });
    return TestBed.inject(AuthService);
  }
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
    jest.restoreAllMocks();
  });
  it('consumes accessToken and keeps refreshToken out of browser storage', async () => {
    const service = setup();
    const store = TestBed.inject(AuthFacade);
    const accessToken = jwt(Date.now() / 1000 + 60);
    const pending = store.login({ username: 'test-user', password: 'test-password' });
    expect(store.isLoading()).toBe(true);
    expect(store.token()).toBeNull();
    const request = TestBed.inject(HttpTestingController).expectOne(loginUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ username: 'test-user', password: 'test-password' });
    request.flush({ accessToken, refreshToken: 'unused-test-refresh' });
    await pending;
    expect(service.getToken()).toBe(accessToken);
    expect(store.token()).toBe(accessToken);
    expect(store.isAuthenticated()).toBe(true);
    expect(service.getUsername()).toBe('test-user');
    expect(localStorage.length).toBe(1);
    service.logout();
    expect(service.getToken()).toBeNull();
  });
  it.each([
    { refreshToken: 'unused-test-refresh' },
    { accessToken: 'malformed', refreshToken: 'unused-test-refresh' },
    { accessToken: jwt(0), refreshToken: 'unused-test-refresh' },
    { accessToken: jwt(Date.now() / 1000 + 60) },
    { accessToken: jwt(Date.now() / 1000 + 60), refreshToken: 123 },
  ])('rejects invalid successful login responses without replacing storage: %j', async (response) => {
    const service = setup();
    const previousToken = jwt(Date.now() / 1000 + 60);
    localStorage.setItem('auth_token', previousToken);
    const rejected = jest.fn();
    const received = jest.fn();
    service.login({ username: 'test-user', password: 'test-password' })
      .subscribe({ next: received, error: rejected });
    TestBed.inject(HttpTestingController).expectOne(loginUrl).flush(response);
    expect(received).not.toHaveBeenCalled();
    expect(rejected).toHaveBeenCalledWith(new Error('Invalid login response'));
    expect(service.getToken()).toBe(previousToken);

    const store = TestBed.inject(AuthFacade);
    const pending = store.login({ username: 'test-user', password: 'test-password' });
    const rejectedLogin = expect(pending).rejects.toThrow('Invalid login response');
    TestBed.inject(HttpTestingController).expectOne(loginUrl).flush(response);
    await rejectedLogin;
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('Invalid login response');
    expect(service.getToken()).toBe(previousToken);
  });
  it('does not access browser storage or attach credentials during SSR', () => {
    const service = setup('server');
    const read = jest.spyOn(Storage.prototype, 'getItem');
    const write = jest.spyOn(Storage.prototype, 'setItem');
    const remove = jest.spyOn(Storage.prototype, 'removeItem');
    service.login({ username: 'test-user', password: 'test-password' }).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(loginUrl);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ accessToken: jwt(Date.now() / 1000 + 60), refreshToken: 'unused-test-refresh' });
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getUsername()).toBeNull();
    service.logout();
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });
  it.each(['broken', 'a.b.c', jwt(0), jwt('9999999999'), jwt(null)])(
    'rejects malformed or expired sessions: %s', (token) => {
      const service = setup();
      localStorage.setItem('auth_token', token);
      const store = TestBed.inject(AuthFacade);
      store.initialize();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.getUsername()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.isAuthenticated()).toBe(false);
      const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
      expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/login');
    }
  );
  it('checks expiry again on each route activation', () => {
    setup();
    const now = Date.now();
    localStorage.setItem('auth_token', jwt(now / 1000 + 60));
    TestBed.inject(AuthFacade).initialize();
    expect(TestBed.runInInjectionContext(() => authGuard(null!, null!))).toBe(true);
    jest.spyOn(Date, 'now').mockReturnValue(now + 61000);
    const result = TestBed.runInInjectionContext(() => authGuard(null!, null!));
    expect(TestBed.inject(Router).serializeUrl(result as ReturnType<Router['createUrlTree']>)).toBe('/login');
  });
  it('honors an explicitly configured API origin rather than the document origin', () => {
    const origin = 'https://api.example.invalid';
    setup('browser', origin);
    const token = jwt(Date.now() / 1000 + 60);
    localStorage.setItem('auth_token', token);
    for (const [url, authorized] of [
      [`${origin}/api/items`, true],
      ['/api/items', false],
      ['https://api.example.invalid.external.invalid/api/items', false],
    ] as const) {
      TestBed.inject(HttpClient).get(url).subscribe();
      const request = TestBed.inject(HttpTestingController).expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe(authorized ? `Bearer ${token}` : null);
      request.flush({});
    }
  });
  it('attaches valid credentials only to the configured API origin and path', () => {
    setup();
    const token = jwt(Date.now() / 1000 + 60);
    localStorage.setItem('auth_token', token);
    const api = new URL(environment.apiUrl || '/', document.baseURI);
    const targets: [string, boolean][] = [
      [`${api.origin}/api/Announcement`, true],
      [`${api.origin}/assets/i18n/en.json`, false],
      [`${api.origin}/api-lookalike/items`, false],
      ['https://external.invalid/api/items', false],
      [`${api.protocol}//${api.hostname}.external.invalid/api/items`, false],
    ];
    for (const [url, authorized] of targets) {
      TestBed.inject(HttpClient).get(url).subscribe();
      const request = TestBed.inject(HttpTestingController).expectOne(url);
      expect(request.request.headers.get('Authorization')).toBe(authorized ? `Bearer ${token}` : null);
      request.flush({});
    }
    localStorage.setItem('auth_token', jwt(0));
    TestBed.inject(HttpClient).get(`${api.origin}/api/items`).subscribe();
    const expired = TestBed.inject(HttpTestingController).expectOne(`${api.origin}/api/items`);
    expect(expired.request.headers.has('Authorization')).toBe(false);
    expired.flush({});
  });
});
