import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest } from '../models/auth.model';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  username: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => {
      const token = store.token();
      if (!token) return false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() < payload.exp * 1000;
      } catch {
        return false;
      }
    }),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    initialize(): void {
      const token = authService.getToken();
      if (token && authService.isAuthenticated()) {
        patchState(store, {
          token,
          refreshToken: authService.getRefreshToken(),
          username: authService.getUsername(),
        });
      }
    },

    async login(request: LoginRequest): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const res = await firstValueFrom(authService.login(request));
        patchState(store, {
          token: res.accessToken,
          refreshToken: res.refreshToken,
          username: authService.getUsername(),
          isLoading: false,
        });
      } catch (err: any) {
        patchState(store, {
          isLoading: false,
          error: err.error?.message ?? 'Login failed',
        });
      }
    },

    async register(request: RegisterRequest): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        await firstValueFrom(authService.register(request));
        patchState(store, { isLoading: false });
      } catch (err: any) {
        patchState(store, {
          isLoading: false,
          error: err.error?.message ?? 'Registration failed',
        });
      }
    },

    logout(): void {
      authService.logout();
      patchState(store, {
        token: null,
        refreshToken: null,
        username: null,
        error: null,
      });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
