import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { AuthService } from '../services/auth.service';
import { LoginRequest, RegisterRequest } from '../models/auth.model';

interface AuthState {
  token: string | null;
  username: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  username: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.token()),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    initialize(): void {
      const token = authService.getToken();
      if (token && authService.isAuthenticated()) {
        patchState(store, {
          token,
          username: authService.getUsername(),
        });
      }
    },

    login(request: LoginRequest): void {
      patchState(store, { isLoading: true, error: null });
      authService.login(request).subscribe({
        next: (res) => {
          patchState(store, {
            token: res.token,
            username: authService.getUsername(),
            isLoading: false,
          });
        },
        error: (err) => {
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Login failed',
          });
        },
      });
    },

    register(request: RegisterRequest): void {
      patchState(store, { isLoading: true, error: null });
      authService.register(request).subscribe({
        next: () => patchState(store, { isLoading: false }),
        error: (err) =>
          patchState(store, {
            isLoading: false,
            error: err.error?.message ?? 'Registration failed',
          }),
      });
    },

    logout(): void {
      authService.logout();
      patchState(store, { token: null, username: null, error: null });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
