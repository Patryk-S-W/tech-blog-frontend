import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { LoginRequest } from '@blog/auth/entity';
import { withCallState } from '@blog/shared/util';
import { AuthService } from '../services/auth.service';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({ token: null as string | null, username: null as string | null }),
  withCallState(),
  withComputed((store, service = inject(AuthService)) => ({
    isAuthenticated: computed(() => !!store.token() && service.isAuthenticated()),
  })),
  withMethods((store, service = inject(AuthService)) => ({
    initialize(): void {
      patchState(store, {
        token: service.isAuthenticated() ? service.getToken() : null,
        username: service.getUsername(),
      });
    },
    async login(request: LoginRequest): Promise<void> {
      store.startCall();
      try {
        const response = await firstValueFrom(service.login(request));
        patchState(store, { token: response.accessToken, username: service.getUsername() });
        store.finishCall();
      } catch (error) {
        const message = error instanceof Error && error.message === 'Invalid login response'
          ? error.message : 'Login failed';
        store.failCall(message);
        throw new Error(message, { cause: error });
      }
    },
    logout(): void {
      service.logout();
      patchState(store, { token: null, username: null, error: null });
    },
  }))
);
