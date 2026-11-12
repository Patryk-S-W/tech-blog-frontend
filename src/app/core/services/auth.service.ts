import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  AuthResponse,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseUrl = `${environment.apiUrl}/api/auth`;
  private readonly tokenKey = 'auth_token';

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(tap((res) => {
        if (!res || typeof res.refreshToken !== 'string' ||
          !this.isValidToken(res.accessToken)) {
          throw new Error('Invalid login response');
        }
        this.setToken(res.accessToken);
      }));
  }

  logout(): void {
    if (this.isBrowser) localStorage.removeItem(this.tokenKey);
  }

  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem(this.tokenKey) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return this.isValidToken(token);
  }

  private isValidToken(token: unknown): token is string {
    if (typeof token !== 'string' || !token) return false;

    try {
      const payload = this.readPayload(token);
      return typeof payload.exp === 'number' &&
        Number.isFinite(payload.exp) && Date.now() < payload.exp * 1000;
    } catch {
      return false;
    }
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token || !this.isAuthenticated()) return null;

    try {
      const payload = this.readPayload(token);
      const username = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
      return typeof username === 'string' ? username : null;
    } catch {
      return null;
    }
  }

  private readPayload(token: string): Record<string, unknown> {
    const parts = token.split('.');
    if (parts.length !== 3 || parts.some((part) => !/^[A-Za-z0-9_-]+$/.test(part))) {
      throw new Error('Invalid token format');
    }
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
  }

  private setToken(token: string): void {
    if (this.isBrowser) localStorage.setItem(this.tokenKey, token);
  }
}
