import { Injectable, inject } from '@angular/core';
import { LoginRequest } from '@blog/auth/entity';
import { AuthStore } from './store/auth.store';
import { AuthService } from './services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(AuthStore);
  private readonly service = inject(AuthService);
  readonly token = this.store.token;
  readonly username = this.store.username;
  readonly isAuthenticated = this.store.isAuthenticated;
  readonly isLoading = this.store.isLoading;
  readonly error = this.store.error;
  initialize(): void { this.store.initialize(); }
  login(request: LoginRequest): Promise<void> { return this.store.login(request); }
  logout(): void { this.store.logout(); }
  clearError(): void { this.store.clearError(); }
  hasValidSession(): boolean { return this.service.isAuthenticated(); }
}
