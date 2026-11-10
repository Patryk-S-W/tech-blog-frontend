import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { authInterceptor } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';

describe('AuthService and authInterceptor', () => {
  function setup(platform: string): AuthService {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: PLATFORM_ID, useValue: platform },
      ],
    });
    return TestBed.inject(AuthService);
  }

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('does not access browser storage or attach credentials on the server', () => {
    const service = setup('server');
    const read = jest.spyOn(Storage.prototype, 'getItem');
    const write = jest.spyOn(Storage.prototype, 'setItem');
    const remove = jest.spyOn(Storage.prototype, 'removeItem');
    expect(service.getToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getUsername()).toBeNull();
    service.logout();
    service.login({ username: 'admin', password: 'password' }).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/api/Auth/login`);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ token: 'server-token' });
    expect(read).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('preserves browser token persistence and authorization', () => {
    const service = setup('browser');
    localStorage.setItem('auth_token', 'existing-token');
    service.login({ username: 'admin', password: 'password' }).subscribe();
    const request = TestBed.inject(HttpTestingController).expectOne(`${environment.apiUrl}/api/Auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer existing-token');
    request.flush({ token: 'new-token' });
    expect(service.getToken()).toBe('new-token');
    service.logout();
    expect(service.getToken()).toBeNull();
  });
});
